const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

// GET /api/appointments
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { doctor_id, patient_id, date, status } = req.query;

    let sql = `
      SELECT a.appointment_id, a.appointment_date, a.appointment_time,
             a.appointment_type, a.status, a.reason, a.notes, a.created_at,
             p.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             p.gender AS patient_gender,
             d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
             d.specialization, dep.dept_name,
             (pr.prescription_id IS NOT NULL) AS has_prescription,
             (lo.lab_order_id IS NOT NULL) AS has_lab_order,
             b.bill_id, b.payment_status AS bill_payment_status
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      JOIN department dep ON d.dept_id = dep.dept_id
      LEFT JOIN prescription pr ON a.appointment_id = pr.appointment_id
      LEFT JOIN lab_order lo ON a.appointment_id = lo.appointment_id
      LEFT JOIN bill b ON a.appointment_id = b.appointment_id
      WHERE 1=1
    `;
    const params = [];

    // Role-based security scoping: doctors only see their appointments, patients only see their appointments
    if (req.user.role === 'Doctor' && req.user.doctor_id) {
      sql += ' AND a.doctor_id = ?';
      params.push(req.user.doctor_id);
    } else if (doctor_id) {
      sql += ' AND a.doctor_id = ?';
      params.push(doctor_id);
    }

    if (req.user.role === 'Patient' && req.user.patient_id) {
      sql += ' AND a.patient_id = ?';
      params.push(req.user.patient_id);
    } else if (patient_id) {
      sql += ' AND a.patient_id = ?';
      params.push(patient_id);
    }

    if (date) {
      sql += ' AND a.appointment_date = ?';
      params.push(date);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/appointments/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const [rows] = await pool.query(`
      SELECT a.appointment_id, a.appointment_date, a.appointment_time,
             a.appointment_type, a.status, a.reason, a.notes, a.created_at,
             p.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             p.gender AS patient_gender, p.date_of_birth,
             d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
             d.specialization, d.consultation_fee, dep.dept_name
      FROM appointment a
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      JOIN department dep ON d.dept_id = dep.dept_id
      WHERE a.appointment_id = ?
    `, [id]);

    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found.' });

    const appointment = rows[0];

    // Fetch Prescription (if any)
    const [prescriptions] = await pool.query(`
      SELECT pr.prescription_id, pr.prescription_date, pr.diagnosis, pr.advice, pr.follow_up_date
      FROM prescription pr
      WHERE pr.appointment_id = ?
    `, [id]);

    let prescriptionData = null;
    if (prescriptions.length > 0) {
      prescriptionData = prescriptions[0];
      const [medicines] = await pool.query(`
        SELECT pm.medicine_id, m.medicine_name, m.generic_name, m.dosage_form, m.strength,
               pm.dosage, pm.frequency, pm.duration_days, pm.quantity, pm.instructions
        FROM prescription_medicine pm
        JOIN medicine m ON pm.medicine_id = m.medicine_id
        WHERE pm.prescription_id = ?
      `, [prescriptionData.prescription_id]);
      prescriptionData.medicines = medicines;
    }

    // Fetch Lab Orders (if any)
    const [labOrders] = await pool.query(`
      SELECT lo.lab_order_id, lo.order_date, lo.priority, lo.status
      FROM lab_order lo
      WHERE lo.appointment_id = ?
    `, [id]);

    for (const lo of labOrders) {
      const [tests] = await pool.query(`
        SELECT lot.test_id, lt.test_name, lt.category, lt.normal_range,
               lot.result_value, lot.result_status, lot.result_date, lot.remarks,
               lot.extra_results, (lot.report_image IS NOT NULL) AS has_report_image
        FROM lab_order_test lot
        JOIN lab_test lt ON lot.test_id = lt.test_id
        WHERE lot.lab_order_id = ?
      `, [lo.lab_order_id]);
      lo.tests = tests;
    }

    // Fetch Bill (if any)
    const [bills] = await pool.query(`
      SELECT b.bill_id, b.bill_date, b.bill_type, b.discount_amount, b.tax_amount,
             b.payment_status, s.total_amount, s.amount_paid, s.balance_due
      FROM bill b
      JOIN v_bill_summary s ON b.bill_id = s.bill_id
      WHERE b.appointment_id = ?
    `, [id]);

    res.json({
      ...appointment,
      prescription: prescriptionData,
      lab_orders: labOrders,
      bill: bills[0] || null
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments
// TRANSACTION 2: Direct insert relying on UNIQUE(doctor_id, appointment_date, appointment_time)
// Never check-then-insert to avoid race conditions!
router.post('/', verifyToken, allowRoles('Admin', 'Receptionist', 'Doctor'), async (req, res, next) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      appointment_type = 'New',
      reason,
      notes
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO appointment (
        patient_id, doctor_id, appointment_date, appointment_time,
        appointment_type, status, reason, notes
      ) VALUES (?, ?, ?, ?, ?, 'Scheduled', ?, ?)
    `, [
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      appointment_type,
      reason,
      notes || null
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment_id: result.insertId
    });
  } catch (err) {
    // If MySQL returns 1062, errorMapper will translate into friendly slot message
    next(err);
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', verifyToken, allowRoles('Admin', 'Receptionist', 'Doctor'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, notes } = req.body;

    let sql = 'UPDATE appointment SET status = ?';
    const params = [status];
    if (notes !== undefined) {
      sql += ', notes = ?';
      params.push(notes);
    }
    sql += ' WHERE appointment_id = ?';
    params.push(id);

    await pool.query(sql, params);
    res.json({ message: 'Appointment status updated.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments/:id/prescription
// TRANSACTION 3: Header + medicines + stock decrement (CHECK stock_quantity >= 0 rejects overselling)
router.post('/:id/prescription', verifyToken, allowRoles('Admin', 'Doctor'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const appointmentId = parseInt(req.params.id, 10);
    const { prescription_date, diagnosis, advice, follow_up_date, medicines = [] } = req.body;

    // 1. Insert prescription header
    const [prescResult] = await conn.query(`
      INSERT INTO prescription (appointment_id, prescription_date, diagnosis, advice, follow_up_date)
      VALUES (?, ?, ?, ?, ?)
    `, [
      appointmentId,
      prescription_date || new Date().toISOString().slice(0, 10),
      diagnosis,
      advice || null,
      follow_up_date || null
    ]);

    const newPrescriptionId = prescResult.insertId;

    // 2. Insert medicines and decrement stock
    for (const item of medicines) {
      const { medicine_id, dosage, frequency, duration_days, quantity, instructions } = item;

      // Insert prescription_medicine
      await conn.query(`
        INSERT INTO prescription_medicine (
          prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        newPrescriptionId,
        medicine_id,
        dosage,
        frequency,
        duration_days,
        quantity,
        instructions || null
      ]);

      // Decrement stock in medicine table
      // Database CHECK (stock_quantity >= 0) will throw error 3819 if oversold!
      await conn.query(`
        UPDATE medicine
        SET stock_quantity = stock_quantity - ?
        WHERE medicine_id = ?
      `, [quantity, medicine_id]);
    }

    // Also mark appointment as Completed
    await conn.query(`
      UPDATE appointment SET status = 'Completed' WHERE appointment_id = ?
    `, [appointmentId]);

    await conn.commit();
    res.status(201).json({
      message: 'Prescription created and medicine stock updated.',
      prescription_id: newPrescriptionId
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// POST /api/appointments/:id/lab-orders
// Create lab order + test items in transaction
router.post('/:id/lab-orders', verifyToken, allowRoles('Admin', 'Doctor'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const appointmentId = parseInt(req.params.id, 10);
    const { priority = 'Routine', test_ids = [] } = req.body;

    const [orderResult] = await conn.query(`
      INSERT INTO lab_order (appointment_id, priority, status)
      VALUES (?, ?, 'Ordered')
    `, [appointmentId, priority]);

    const labOrderId = orderResult.insertId;

    for (const testId of test_ids) {
      await conn.query(`
        INSERT INTO lab_order_test (lab_order_id, test_id)
        VALUES (?, ?)
      `, [labOrderId, testId]);
    }

    await conn.commit();
    res.status(201).json({
      message: 'Lab tests ordered successfully.',
      lab_order_id: labOrderId
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
