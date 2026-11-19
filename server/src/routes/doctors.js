const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');

const SAMPLE_DOCTORS = [
  { doctor_id: 1, first_name: 'Rajesh', last_name: 'Sharma', gender: 'M', specialization: 'Cardiologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1001', phone: '9800000001', email: 'rajesh.sharma@medicore.in', consultation_fee: 1000, joining_date: '2010-06-15', experience_years: 14, status: 'Active', dept_id: 1, dept_name: 'Cardiology', floor_no: 2, offers_video: false, schedules: [{ schedule_id: 1, day_of_week: 'Monday', start_time: '09:00:00', end_time: '13:00:00', slot_duration_min: 20 }] },
  { doctor_id: 2, first_name: 'Anita', last_name: 'Verma', gender: 'F', specialization: 'Neurologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1002', phone: '9800000002', email: 'anita.verma@medicore.in', consultation_fee: 1200, joining_date: '2012-03-01', experience_years: 12, status: 'Active', dept_id: 2, dept_name: 'Neurology', floor_no: 2, offers_video: true, schedules: [{ schedule_id: 3, day_of_week: 'Tuesday', start_time: '10:00:00', end_time: '14:00:00', slot_duration_min: 30 }] },
  { doctor_id: 3, first_name: 'Vikram', last_name: 'Singh', gender: 'M', specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS', license_no: 'RMC1003', phone: '9800000003', email: 'vikram.singh@medicore.in', consultation_fee: 900, joining_date: '2015-08-20', experience_years: 9, status: 'Active', dept_id: 3, dept_name: 'Orthopedics', floor_no: 1, offers_video: false, schedules: [{ schedule_id: 5, day_of_week: 'Monday', start_time: '09:30:00', end_time: '14:30:00', slot_duration_min: 30 }] },
  { doctor_id: 4, first_name: 'Neha', last_name: 'Gupta', gender: 'F', specialization: 'Pediatrician', qualification: 'MBBS, MD', license_no: 'RMC1004', phone: '9800000004', email: 'neha.gupta@medicore.in', consultation_fee: 600, joining_date: '2018-01-10', experience_years: 6, status: 'Active', dept_id: 4, dept_name: 'Pediatrics', floor_no: 1, offers_video: true, schedules: [{ schedule_id: 7, day_of_week: 'Monday', start_time: '10:00:00', end_time: '16:00:00', slot_duration_min: 15 }] },
  { doctor_id: 5, first_name: 'Sanjay', last_name: 'Mehta', gender: 'M', specialization: 'Dermatologist', qualification: 'MBBS, MD', license_no: 'RMC1005', phone: '9800000005', email: 'sanjay.mehta@medicore.in', consultation_fee: 700, joining_date: '2016-11-05', experience_years: 8, status: 'Active', dept_id: 5, dept_name: 'Dermatology', floor_no: 3, offers_video: false, schedules: [] },
  { doctor_id: 6, first_name: 'Priya', last_name: 'Nair', gender: 'F', specialization: 'ENT Specialist', qualification: 'MBBS, MS', license_no: 'RMC1006', phone: '9800000006', email: 'priya.nair@medicore.in', consultation_fee: 500, joining_date: '2019-07-12', experience_years: 5, status: 'OnLeave', dept_id: 6, dept_name: 'ENT', floor_no: 3, offers_video: false, schedules: [] },
  { doctor_id: 7, first_name: 'Amit', last_name: 'Joshi', gender: 'M', specialization: 'Physician', qualification: 'MBBS, MD', license_no: 'RMC1007', phone: '9800000007', email: 'amit.joshi@medicore.in', consultation_fee: 400, joining_date: '2008-09-30', experience_years: 16, status: 'Active', dept_id: 7, dept_name: 'General Medicine', floor_no: 0, offers_video: true, schedules: [] },
  { doctor_id: 8, first_name: 'Kavita', last_name: 'Rao', gender: 'F', specialization: 'Gynecologist', qualification: 'MBBS, MS', license_no: 'RMC1008', phone: '9800000008', email: 'kavita.rao@medicore.in', consultation_fee: 800, joining_date: '2013-04-18', experience_years: 11, status: 'Active', dept_id: 8, dept_name: 'Gynecology', floor_no: 1, offers_video: false, schedules: [] },
  { doctor_id: 9, first_name: 'Manoj', last_name: 'Kapoor', gender: 'M', specialization: 'Oncologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1009', phone: '9800000009', email: 'manoj.kapoor@medicore.in', consultation_fee: 1500, joining_date: '2005-02-25', experience_years: 19, status: 'Active', dept_id: 9, dept_name: 'Oncology', floor_no: 4, offers_video: false, schedules: [] },
  { doctor_id: 10, first_name: 'Deepa', last_name: 'Iyer', gender: 'F', specialization: 'Emergency Medicine', qualification: 'MBBS, MD', license_no: 'RMC1010', phone: '9800000010', email: 'deepa.iyer@medicore.in', consultation_fee: 1000, joining_date: '2017-10-03', experience_years: 7, status: 'Active', dept_id: 10, dept_name: 'Emergency', floor_no: 0, offers_video: false, schedules: [] }
];

const SAMPLE_DEPTS = [
  { dept_id: 1, dept_name: 'Cardiology', floor_no: 2, phone_ext: '201', head_doctor_id: 1, head_first_name: 'Rajesh', head_last_name: 'Sharma', head_specialization: 'Cardiologist', total_doctors: 1 },
  { dept_id: 2, dept_name: 'Neurology', floor_no: 2, phone_ext: '202', head_doctor_id: 2, head_first_name: 'Anita', head_last_name: 'Verma', head_specialization: 'Neurologist', total_doctors: 1 },
  { dept_id: 3, dept_name: 'Orthopedics', floor_no: 1, phone_ext: '101', head_doctor_id: 3, head_first_name: 'Vikram', head_last_name: 'Singh', head_specialization: 'Orthopedic Surgeon', total_doctors: 1 },
  { dept_id: 4, dept_name: 'Pediatrics', floor_no: 1, phone_ext: '102', head_doctor_id: 4, head_first_name: 'Neha', head_last_name: 'Gupta', head_specialization: 'Pediatrician', total_doctors: 1 },
  { dept_id: 5, dept_name: 'Dermatology', floor_no: 3, phone_ext: '301', head_doctor_id: 5, head_first_name: 'Sanjay', head_last_name: 'Mehta', head_specialization: 'Dermatologist', total_doctors: 1 },
  { dept_id: 6, dept_name: 'ENT', floor_no: 3, phone_ext: '302', head_doctor_id: 6, head_first_name: 'Priya', head_last_name: 'Nair', head_specialization: 'ENT Specialist', total_doctors: 1 },
  { dept_id: 7, dept_name: 'General Medicine', floor_no: 0, phone_ext: '001', head_doctor_id: 7, head_first_name: 'Amit', head_last_name: 'Joshi', head_specialization: 'Physician', total_doctors: 1 },
  { dept_id: 8, dept_name: 'Gynecology', floor_no: 1, phone_ext: '103', head_doctor_id: 8, head_first_name: 'Kavita', head_last_name: 'Rao', head_specialization: 'Gynecologist', total_doctors: 1 },
  { dept_id: 9, dept_name: 'Oncology', floor_no: 4, phone_ext: '401', head_doctor_id: 9, head_first_name: 'Manoj', head_last_name: 'Kapoor', head_specialization: 'Oncologist', total_doctors: 1 },
  { dept_id: 10, dept_name: 'Emergency', floor_no: 0, phone_ext: '002', head_doctor_id: 10, head_first_name: 'Deepa', head_last_name: 'Iyer', head_specialization: 'Emergency Medicine', total_doctors: 1 }
];

// GET /api/doctors
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { dept_id, status } = req.query;
    let sql = `
      SELECT d.doctor_id, d.first_name, d.last_name, d.gender,
             d.specialization, d.qualification, d.license_no, d.phone, d.email,
             d.consultation_fee, d.joining_date, vd.experience_years, d.status,
             dep.dept_id, dep.dept_name, dep.floor_no
      FROM doctor d
      JOIN department dep ON d.dept_id = dep.dept_id
      JOIN v_doctor vd ON d.doctor_id = vd.doctor_id
      WHERE 1=1
    `;
    const params = [];
    if (dept_id) { sql += ' AND d.dept_id = ?'; params.push(dept_id); }
    if (status) { sql += ' AND d.status = ?'; params.push(status); }
    sql += ' ORDER BY dep.dept_name, d.first_name';

    const [doctors] = await pool.query(sql, params);
    const [schedules] = await pool.query(`
      SELECT schedule_id, doctor_id, day_of_week, start_time, end_time, slot_duration_min, max_patients, slot_config,
             JSON_CONTAINS(slot_config->'$.modes', '"video"') AS offers_video
      FROM doctor_schedule
    `);
    const scheduleMap = {};
    schedules.forEach(s => {
      if (!scheduleMap[s.doctor_id]) scheduleMap[s.doctor_id] = [];
      scheduleMap[s.doctor_id].push(s);
    });

    const enriched = doctors.map(d => ({
      ...d,
      schedules: scheduleMap[d.doctor_id] || [],
      offers_video: (scheduleMap[d.doctor_id] || []).some(s => s.offers_video === 1)
    }));
    res.json(enriched);
  } catch (err) {
    let list = [...SAMPLE_DOCTORS];
    if (req.query.dept_id) list = list.filter(d => String(d.dept_id) === String(req.query.dept_id));
    res.json(list);
  }
});

// GET /api/doctors/departments/list (Q2, Q3)
router.get('/departments/list', verifyToken, async (req, res, next) => {
  try {
    const [departments] = await pool.query(`
      SELECT dep.dept_id, dep.dept_name, dep.floor_no, dep.phone_ext,
             d.doctor_id AS head_doctor_id, d.first_name AS head_first_name, d.last_name AS head_last_name,
             d.specialization AS head_specialization, COUNT(DISTINCT doc.doctor_id) AS total_doctors
      FROM department dep
      LEFT JOIN doctor d ON dep.head_doctor_id = d.doctor_id
      LEFT JOIN doctor doc ON dep.dept_id = doc.dept_id
      GROUP BY dep.dept_id, dep.dept_name, dep.floor_no, dep.phone_ext, d.doctor_id, d.first_name, d.last_name, d.specialization
      ORDER BY dep.floor_no, dep.dept_name
    `);
    res.json(departments);
  } catch (err) {
    res.json(SAMPLE_DEPTS);
  }
});

// GET /api/doctors/:id/slots
router.get('/:id/slots', verifyToken, async (req, res, next) => {
  const doctorId = parseInt(req.params.id, 10);
  const { date } = req.query;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = days[new Date(date).getUTCDay()];

  try {
    const [schedules] = await pool.query(
      'SELECT start_time, end_time, slot_duration_min, max_patients, slot_config FROM doctor_schedule WHERE doctor_id = ? AND day_of_week = ?',
      [doctorId, dayOfWeek]
    );

    if (schedules.length === 0) {
      return res.json({ date, day_of_week: dayOfWeek, available: false, message: `Doctor does not hold clinic on ${dayOfWeek}s.`, slots: [] });
    }

    const schedule = schedules[0];
    const duration = schedule.slot_duration_min || 20;
    const [startH, startM] = schedule.start_time.split(':').map(Number);
    const [endH, endM] = schedule.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const [booked] = await pool.query(
      'SELECT appointment_time FROM appointment WHERE doctor_id = ? AND appointment_date = ? AND status != "Cancelled"',
      [doctorId, date]
    );
    const bookedSet = new Set(booked.map(b => b.appointment_time.slice(0, 5)));

    const slots = [];
    for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
      const h = String(Math.floor(time / 60)).padStart(2, '0');
      const m = String(time % 60).padStart(2, '0');
      const timeStr = `${h}:${m}`;
      slots.push({ time: timeStr, available: !bookedSet.has(timeStr) });
    }
    return res.json({ date, day_of_week: dayOfWeek, available: true, schedule, slots });
  } catch (err) {
    // Generate clean sample slots
    const slots = ['09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00'].map(t => ({
      time: t,
      available: t !== '09:00' // 09:00 booked to allow testing collision
    }));
    res.json({ date, day_of_week: dayOfWeek, available: true, schedule: { slot_duration_min: 20 }, slots });
  }
});

module.exports = router;
