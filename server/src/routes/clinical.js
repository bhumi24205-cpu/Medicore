const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const upload = require('../middleware/upload');

// GET /api/clinical/medicines (catalogue + stock)
router.get('/medicines', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT medicine_id, medicine_name, generic_name, manufacturer,
             dosage_form, strength, unit_price, stock_quantity
      FROM medicine
      ORDER BY medicine_name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/clinical/lab-tests (catalogue)
router.get('/lab-tests', verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT test_id, test_name, category, sample_type, normal_range, price, turnaround_hours
      FROM lab_test
      ORDER BY category, test_name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/clinical/lab-orders (orders list)
router.get('/lab-orders', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT lo.lab_order_id, lo.appointment_id, lo.order_date, lo.priority, lo.status,
             p.patient_id, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             d.doctor_id, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
             COUNT(lot.test_id) AS total_tests
      FROM lab_order lo
      JOIN appointment a ON lo.appointment_id = a.appointment_id
      JOIN patient p ON a.patient_id = p.patient_id
      JOIN doctor d ON a.doctor_id = d.doctor_id
      LEFT JOIN lab_order_test lot ON lo.lab_order_id = lot.lab_order_id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ' AND lo.status = ?';
      params.push(status);
    }
    sql += ' GROUP BY lo.lab_order_id ORDER BY lo.order_date DESC';

    const [orders] = await pool.query(sql, params);

    for (const order of orders) {
      const [tests] = await pool.query(`
        SELECT lot.test_id, lt.test_name, lt.category, lt.normal_range,
               lot.result_value, lot.result_status, lot.result_date, lot.remarks,
               lot.extra_results, (lot.report_image IS NOT NULL) AS has_report_image
        FROM lab_order_test lot
        JOIN lab_test lt ON lot.test_id = lt.test_id
        WHERE lot.lab_order_id = ?
      `, [order.lab_order_id]);
      order.tests = tests;
    }

    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PUT /api/clinical/lab-orders/:orderId/tests/:testId
// Enters results, validates extra_results JSON (J3), uploads report_image BLOB (B2)
router.put('/lab-orders/:orderId/tests/:testId', verifyToken, allowRoles('Admin', 'Doctor'), upload.single('report_image'), async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const testId = parseInt(req.params.testId, 10);
    const { result_value, result_status, remarks, extra_results } = req.body;

    const jsonString = extra_results
      ? (typeof extra_results === 'string' ? extra_results : JSON.stringify(extra_results))
      : null;

    let sql = `
      UPDATE lab_order_test
      SET result_value = ?,
          result_status = ?,
          remarks = ?,
          extra_results = ?,
          result_date = NOW()
    `;
    const params = [result_value || null, result_status || null, remarks || null, jsonString];

    if (req.file) {
      sql += ', report_image = ?, report_mime = ?';
      params.push(req.file.buffer, req.file.mimetype);
    }

    sql += ' WHERE lab_order_id = ? AND test_id = ?';
    params.push(orderId, testId);

    await pool.query(sql, params);

    // Update order status to Completed if all tests have results
    const [pending] = await pool.query(`
      SELECT COUNT(*) AS cnt FROM lab_order_test
      WHERE lab_order_id = ? AND result_value IS NULL
    `, [orderId]);

    if (pending[0].cnt === 0) {
      await pool.query('UPDATE lab_order SET status = "Completed" WHERE lab_order_id = ?', [orderId]);
    } else {
      await pool.query('UPDATE lab_order SET status = "Collected" WHERE lab_order_id = ?', [orderId]);
    }

    res.json({ message: 'Lab result recorded successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/clinical/lab-orders/:orderId/tests/:testId/image -> Streams BLOB image (B2)
router.get('/lab-orders/:orderId/tests/:testId/image', async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    const testId = parseInt(req.params.testId, 10);

    const [rows] = await pool.query(`
      SELECT report_image, report_mime
      FROM lab_order_test
      WHERE lab_order_id = ? AND test_id = ?
    `, [orderId, testId]);

    if (rows.length === 0 || !rows[0].report_image) {
      return res.status(404).json({ message: 'Report image not found.' });
    }

    const mime = rows[0].report_mime || 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Length', rows[0].report_image.length);
    res.end(rows[0].report_image);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
