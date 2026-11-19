const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

// GET /api/admissions/rooms (Bed board)
router.get('/rooms', verifyToken, async (req, res, next) => {
  try {
    const [rooms] = await pool.query(`
      SELECT r.room_id, r.room_number, r.room_type, r.floor_no,
             r.bed_capacity, r.daily_charge, r.availability,
             COUNT(a.admission_id) AS current_admissions
      FROM room r
      LEFT JOIN admission a ON r.room_id = a.room_id AND a.status = 'Admitted'
      GROUP BY r.room_id
      ORDER BY r.floor_no, r.room_number
    `);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
});

// GET /api/admissions (Q11, Q14)
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT ad.admission_id, ad.patient_id, ad.room_id, ad.doctor_id,
             ad.admission_date, ad.discharge_date, ad.admission_type,
             ad.diagnosis, ad.status,
             va.length_of_stay,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             p.gender AS patient_gender,
             r.room_number, r.room_type, r.floor_no, r.daily_charge,
             d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
             b.bill_id, b.payment_status AS bill_payment_status
      FROM admission ad
      JOIN v_admission va ON ad.admission_id = va.admission_id
      JOIN patient p ON ad.patient_id = p.patient_id
      JOIN room r ON ad.room_id = r.room_id
      JOIN doctor d ON ad.doctor_id = d.doctor_id
      LEFT JOIN bill b ON ad.admission_id = b.admission_id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ' AND ad.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY ad.admission_date DESC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admissions
// TRANSACTION 4 (Admit): Insert admission and set room.availability = 'Occupied'
router.post('/', verifyToken, allowRoles('Admin', 'Receptionist'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      patient_id,
      room_id,
      doctor_id,
      admission_date,
      admission_type = 'Planned',
      diagnosis
    } = req.body;

    const [result] = await conn.query(`
      INSERT INTO admission (
        patient_id, room_id, doctor_id, admission_date, admission_type, diagnosis, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'Admitted')
    `, [
      patient_id,
      room_id,
      doctor_id,
      admission_date || new Date().toISOString().slice(0, 19).replace('T', ' '),
      admission_type,
      diagnosis
    ]);

    // Update room availability
    await conn.query('UPDATE room SET availability = "Occupied" WHERE room_id = ?', [room_id]);

    await conn.commit();
    res.status(201).json({
      message: 'Patient admitted successfully.',
      admission_id: result.insertId
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// PATCH /api/admissions/:id/discharge
// TRANSACTION 4 (Discharge): Set discharge_date and status = 'Discharged', then free the room
router.patch('/:id/discharge', verifyToken, allowRoles('Admin', 'Receptionist', 'Doctor'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const admissionId = parseInt(req.params.id, 10);
    const { discharge_date } = req.body;

    const [admissions] = await conn.query(
      'SELECT room_id FROM admission WHERE admission_id = ?',
      [admissionId]
    );

    if (admissions.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Admission record not found.' });
    }

    const roomId = admissions[0].room_id;
    const dischargeTime = discharge_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update admission record (Database CHECK discharge_date >= admission_date will validate!)
    await conn.query(`
      UPDATE admission
      SET discharge_date = ?, status = 'Discharged'
      WHERE admission_id = ?
    `, [dischargeTime, admissionId]);

    // Free the room if no other active admissions in it
    const [activeInRoom] = await conn.query(`
      SELECT COUNT(*) AS cnt FROM admission WHERE room_id = ? AND status = 'Admitted'
    `, [roomId]);

    if (activeInRoom[0].cnt === 0) {
      await conn.query('UPDATE room SET availability = "Available" WHERE room_id = ?', [roomId]);
    }

    await conn.commit();
    res.json({ message: 'Patient discharged successfully and room status updated.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
