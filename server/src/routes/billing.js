const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

// Helper to recompute and update bill.payment_status within an active transaction
async function syncBillPaymentStatus(conn, billId) {
  const [summaryRows] = await conn.query(`
    SELECT total_amount, amount_paid, balance_due
    FROM v_bill_summary
    WHERE bill_id = ?
  `, [billId]);

  if (summaryRows.length === 0) return;

  const { total_amount, amount_paid, balance_due } = summaryRows[0];
  let status = 'Unpaid';
  if (amount_paid >= total_amount && total_amount > 0) {
    status = 'Paid';
  } else if (amount_paid > 0 && balance_due > 0) {
    status = 'Partial';
  }

  await conn.query('UPDATE bill SET payment_status = ? WHERE bill_id = ?', [status, billId]);
}

// GET /api/bills (Q15, Q16)
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { payment_status, bill_type, patient_id } = req.query;

    let sql = `
      SELECT b.bill_id, b.patient_id, b.appointment_id, b.admission_id,
             b.bill_date, b.bill_type, b.discount_amount, b.tax_amount,
             b.payment_status,
             s.total_amount, s.amount_paid, s.balance_due,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name
      FROM bill b
      JOIN v_bill_summary s ON b.bill_id = s.bill_id
      JOIN patient p ON b.patient_id = p.patient_id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'Patient' && req.user.patient_id) {
      sql += ' AND b.patient_id = ?';
      params.push(req.user.patient_id);
    } else if (patient_id) {
      sql += ' AND b.patient_id = ?';
      params.push(patient_id);
    }

    if (payment_status) {
      sql += ' AND b.payment_status = ?';
      params.push(payment_status);
    }
    if (bill_type) {
      sql += ' AND b.bill_type = ?';
      params.push(bill_type);
    }

    sql += ' ORDER BY b.bill_date DESC, b.bill_id DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/bills/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const billId = parseInt(req.params.id, 10);

    const [bills] = await pool.query(`
      SELECT b.bill_id, b.patient_id, b.appointment_id, b.admission_id,
             b.bill_date, b.bill_type, b.discount_amount, b.tax_amount,
             b.payment_status,
             s.total_amount, s.amount_paid, s.balance_due,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             p.email AS patient_email, p.street, p.city, p.pincode
      FROM bill b
      JOIN v_bill_summary s ON b.bill_id = s.bill_id
      JOIN patient p ON b.patient_id = p.patient_id
      WHERE b.bill_id = ?
    `, [billId]);

    if (bills.length === 0) return res.status(404).json({ message: 'Bill not found.' });

    const bill = bills[0];

    // Bill Items
    const [items] = await pool.query(`
      SELECT item_no, item_type, description, quantity, unit_price,
             (quantity * unit_price) AS line_total
      FROM bill_item
      WHERE bill_id = ?
      ORDER BY item_no ASC
    `, [billId]);

    // Payments settled
    const [payments] = await pool.query(`
      SELECT payment_id, payment_date, amount, payment_mode, transaction_ref
      FROM payment
      WHERE bill_id = ?
      ORDER BY payment_date ASC
    `, [billId]);

    res.json({
      ...bill,
      items,
      payments
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/bills
// TRANSACTION 5 (Create Bill): Create bill and initial bill items
router.post('/', verifyToken, allowRoles('Admin', 'Billing'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      patient_id,
      appointment_id,
      admission_id,
      bill_date,
      bill_type = 'OPD',
      discount_amount = 0,
      tax_amount = 0,
      items = []
    } = req.body;

    const [billResult] = await conn.query(`
      INSERT INTO bill (
        patient_id, appointment_id, admission_id, bill_date,
        bill_type, discount_amount, tax_amount, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Unpaid')
    `, [
      patient_id,
      appointment_id || null,
      admission_id || null,
      bill_date || new Date().toISOString().slice(0, 10),
      bill_type,
      discount_amount,
      tax_amount
    ]);

    const billId = billResult.insertId;

    // Insert bill items
    let itemNo = 1;
    for (const item of items) {
      await conn.query(`
        INSERT INTO bill_item (bill_id, item_no, item_type, description, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        billId,
        itemNo++,
        item.item_type,
        item.description,
        item.quantity || 1,
        item.unit_price
      ]);
    }

    await syncBillPaymentStatus(conn, billId);

    await conn.commit();
    res.status(201).json({
      message: 'Bill created successfully.',
      bill_id: billId
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// POST /api/bills/:id/items
// Add item to existing bill
router.post('/:id/items', verifyToken, allowRoles('Admin', 'Billing'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const billId = parseInt(req.params.id, 10);
    const { item_type, description, quantity = 1, unit_price } = req.body;

    // Get max item_no
    const [maxRows] = await conn.query(
      'SELECT IFNULL(MAX(item_no), 0) + 1 AS next_item_no FROM bill_item WHERE bill_id = ?',
      [billId]
    );
    const nextItemNo = maxRows[0].next_item_no;

    await conn.query(`
      INSERT INTO bill_item (bill_id, item_no, item_type, description, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [billId, nextItemNo, item_type, description, quantity, unit_price]);

    await syncBillPaymentStatus(conn, billId);

    await conn.commit();
    res.status(201).json({ message: 'Bill item added successfully.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// POST /api/bills/:id/payments
// TRANSACTION 5 (Payment): Insert payment, recompute and update bill.payment_status in SAME transaction!
router.post('/:id/payments', verifyToken, allowRoles('Admin', 'Billing'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const billId = parseInt(req.params.id, 10);
    const { amount, payment_mode, transaction_ref, payment_date } = req.body;

    const [paymentResult] = await conn.query(`
      INSERT INTO payment (bill_id, payment_date, amount, payment_mode, transaction_ref)
      VALUES (?, ?, ?, ?, ?)
    `, [
      billId,
      payment_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      amount,
      payment_mode,
      transaction_ref || null
    ]);

    // Recompute and update bill.payment_status from v_bill_summary in the SAME transaction
    await syncBillPaymentStatus(conn, billId);

    await conn.commit();
    res.status(201).json({
      message: 'Payment recorded and bill payment status updated.',
      payment_id: paymentResult.insertId
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
