const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const upload = require('../middleware/upload');

const HOSPITAL_LNG = 75.7873;
const HOSPITAL_LAT = 26.9124;

const SAMPLE_PATIENTS = [
  { patient_id: 1, first_name: 'Rohan', middle_name: 'Kumar', last_name: 'Mishra', date_of_birth: '1985-04-12', age: 39, gender: 'M', blood_group: 'O+', email: 'rohan.mishra@mail.com', street: '12 MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', registration_date: '2024-01-10', national_id: 'ID1001', home_latitude: 26.9150, home_longitude: 75.8000, medical_profile: '{"allergies": ["Penicillin"], "chronic": ["Hypertension"]}', has_photo: 1, distance_km: 1.30, phones: ['9811100001', '9811100101'] },
  { patient_id: 2, first_name: 'Sunita', middle_name: null, last_name: 'Devi', date_of_birth: '1972-09-30', age: 52, gender: 'F', blood_group: 'A+', email: 'sunita.devi@mail.com', street: '45 Tonk Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302018', registration_date: '2024-02-14', national_id: 'ID1002', home_latitude: 26.8500, home_longitude: 75.8100, medical_profile: '{"allergies": [], "chronic": ["Diabetes", "Migraine"]}', has_photo: 0, distance_km: 7.27, phones: ['9811100002'] },
  { patient_id: 3, first_name: 'Arjun', middle_name: null, last_name: 'Reddy', date_of_birth: '1995-12-05', age: 28, gender: 'M', blood_group: 'B+', email: 'arjun.reddy@mail.com', street: '7 Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302021', registration_date: '2024-03-02', national_id: 'ID1003', home_latitude: 26.9200, home_longitude: 75.7400, medical_profile: '{"allergies": ["Dust"], "chronic": []}', has_photo: 0, distance_km: 4.77, phones: ['9811100003'] },
  { patient_id: 4, first_name: 'Meera', middle_name: 'Lal', last_name: 'Patel', date_of_birth: '2016-07-21', age: 8, gender: 'F', blood_group: 'AB+', email: null, street: '88 Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302017', registration_date: '2024-03-18', national_id: null, home_latitude: 26.8600, home_longitude: 75.8100, medical_profile: '{"allergies": ["Peanuts"], "chronic": ["Asthma"]}', has_photo: 0, distance_km: 6.22, phones: ['9811100004'] },
  { patient_id: 5, first_name: 'Imran', middle_name: null, last_name: 'Khan', date_of_birth: '1990-01-17', age: 34, gender: 'M', blood_group: 'O-', email: 'imran.khan@mail.com', street: '5 Civil Lines', city: 'Jaipur', state: 'Rajasthan', pincode: '302006', registration_date: '2024-04-05', national_id: 'ID1005', home_latitude: 26.9300, home_longitude: 75.8000, medical_profile: '{"allergies": [], "chronic": []}', has_photo: 0, distance_km: 2.34, phones: ['9811100005'] },
  { patient_id: 6, first_name: 'Pooja', middle_name: null, last_name: 'Sharma', date_of_birth: '1968-11-02', age: 56, gender: 'F', blood_group: 'A-', email: 'pooja.sharma@mail.com', street: '23 Sodala', city: 'Jaipur', state: 'Rajasthan', pincode: '302019', registration_date: '2024-04-22', national_id: 'ID1006', home_latitude: 26.9000, home_longitude: 75.7600, medical_profile: '{"allergies": ["Sulfa drugs"], "chronic": ["Thyroid"]}', has_photo: 0, distance_km: 3.03, phones: ['9811100006'] },
  { patient_id: 7, first_name: 'Harsh', middle_name: 'Raj', last_name: 'Agarwal', date_of_birth: '1958-06-09', age: 66, gender: 'M', blood_group: 'B-', email: 'harsh.agarwal@mail.com', street: '9 Bani Park', city: 'Jaipur', state: 'Rajasthan', pincode: '302016', registration_date: '2024-05-11', national_id: 'ID1007', home_latitude: 26.9400, home_longitude: 75.7900, medical_profile: '{"allergies": [], "chronic": ["Heart disease", "Diabetes"]}', has_photo: 0, distance_km: 3.08, phones: ['9811100007'] },
  { patient_id: 8, first_name: 'Kiran', middle_name: null, last_name: 'Bhatia', date_of_birth: '2001-03-27', age: 23, gender: 'F', blood_group: 'O+', email: 'kiran.bhatia@mail.com', street: '31 Mansarovar', city: 'Jaipur', state: 'Rajasthan', pincode: '302020', registration_date: '2024-06-01', national_id: 'ID1008', home_latitude: 26.8700, home_longitude: 75.7500, medical_profile: '{"allergies": [], "chronic": []}', has_photo: 0, distance_km: 5.92, phones: ['9811100008'] },
  { patient_id: 9, first_name: 'Vivek', middle_name: null, last_name: 'Chauhan', date_of_birth: '1979-08-14', age: 45, gender: 'M', blood_group: 'A+', email: 'vivek.chauhan@mail.com', street: '17 Ajmer Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302006', registration_date: '2024-06-19', national_id: 'ID1009', home_latitude: 26.9000, home_longitude: 75.7200, medical_profile: '{"allergies": ["Aspirin"], "chronic": ["Arthritis"]}', has_photo: 0, distance_km: 6.84, phones: ['9811100009'] },
  { patient_id: 10, first_name: 'Anjali', middle_name: null, last_name: 'Saxena', date_of_birth: '1988-02-23', age: 36, gender: 'F', blood_group: 'B+', email: 'anjali.saxena@mail.com', street: '60 Sector 14', city: 'Gurugram', state: 'Haryana', pincode: '122001', registration_date: '2024-07-07', national_id: 'ID1010', home_latitude: 28.4595, home_longitude: 77.0266, medical_profile: '{"allergies": [], "chronic": ["PCOS"]}', has_photo: 0, distance_km: 215.4, phones: ['9811100010'] },
  { patient_id: 11, first_name: 'Deepak', middle_name: null, last_name: 'Yadav', date_of_birth: '1993-10-10', age: 31, gender: 'M', blood_group: 'AB-', email: 'deepak.yadav@mail.com', street: '14 Sanganer', city: 'Jaipur', state: 'Rajasthan', pincode: '302029', registration_date: '2024-08-15', national_id: 'ID1011', home_latitude: 26.8200, home_longitude: 75.7900, medical_profile: null, has_photo: 0, distance_km: 10.28, phones: ['9811100011'] },
  { patient_id: 12, first_name: 'Nisha', middle_name: null, last_name: 'Jain', date_of_birth: '1999-05-30', age: 25, gender: 'F', blood_group: 'O+', email: 'nisha.jain@mail.com', street: '2 Jawahar Nagar', city: 'Delhi', state: 'Delhi', pincode: '110001', registration_date: '2024-09-03', national_id: 'ID1012', home_latitude: 28.6139, home_longitude: 77.2090, medical_profile: '{"allergies": ["Latex"], "chronic": []}', has_photo: 0, distance_km: 236.1, phones: ['9811100012'] }
];

// GET /api/patients
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const { search, city, allergy, withinKm, sortByDistance } = req.query;

    let sql = `
      SELECT p.patient_id, p.first_name, p.middle_name, p.last_name,
             p.date_of_birth, vp.age, p.gender, p.blood_group, p.email,
             p.street, p.city, p.state, p.pincode, p.registration_date, p.national_id,
             p.home_latitude, p.home_longitude, p.medical_profile,
             (p.photo IS NOT NULL) AS has_photo,
             ROUND(ST_Distance_Sphere(POINT(p.home_longitude, p.home_latitude),
                                      POINT(?, ?)) / 1000, 2) AS distance_km
      FROM patient p
      JOIN v_patient vp ON p.patient_id = vp.patient_id
      WHERE 1=1
    `;
    const params = [HOSPITAL_LNG, HOSPITAL_LAT];

    if (search) {
      sql += ` AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.national_id LIKE ? OR CONCAT(p.first_name, ' ', p.last_name) LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (city) {
      sql += ` AND p.city = ?`;
      params.push(city);
    }
    if (allergy) {
      sql += ` AND JSON_CONTAINS(p.medical_profile, ?, '$.allergies')`;
      params.push(JSON.stringify(allergy));
    }
    if (withinKm) {
      const radiusMeters = parseFloat(withinKm) * 1000;
      sql += ` AND ST_Distance_Sphere(POINT(p.home_longitude, p.home_latitude), POINT(?, ?)) <= ?`;
      params.push(HOSPITAL_LNG, HOSPITAL_LAT, radiusMeters);
    }
    if (sortByDistance === 'true' || sortByDistance === '1') {
      sql += ` ORDER BY distance_km ASC`;
    } else {
      sql += ` ORDER BY p.patient_id ASC`;
    }

    const [patients] = await pool.query(sql, params);

    const [phones] = await pool.query('SELECT patient_id, phone FROM patient_phone ORDER BY patient_id');
    const phoneMap = {};
    phones.forEach(row => {
      if (!phoneMap[row.patient_id]) phoneMap[row.patient_id] = [];
      phoneMap[row.patient_id].push(row.phone);
    });

    const enriched = patients.map(p => ({
      ...p,
      phones: phoneMap[p.patient_id] || []
    }));

    res.json(enriched);
  } catch (err) {
    // Fallback filter over sample data
    let filtered = [...SAMPLE_PATIENTS];
    const { search, city, allergy, withinKm, sortByDistance } = req.query;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.first_name.toLowerCase().includes(q) || p.last_name.toLowerCase().includes(q));
    }
    if (city) {
      filtered = filtered.filter(p => p.city === city);
    }
    if (allergy) {
      filtered = filtered.filter(p => {
        try {
          const med = JSON.parse(p.medical_profile || '{}');
          return med.allergies && med.allergies.includes(allergy);
        } catch (e) { return false; }
      });
    }
    if (withinKm) {
      const r = parseFloat(withinKm);
      filtered = filtered.filter(p => p.distance_km <= r);
    }
    if (sortByDistance === 'true' || sortByDistance === '1') {
      filtered.sort((a, b) => a.distance_km - b.distance_km);
    }
    res.json(filtered);
  }
});

// GET /api/patients/:id
router.get('/:id', verifyToken, async (req, res, next) => {
  const patientId = parseInt(req.params.id, 10);
  try {
    const [patientRows] = await pool.query(`
      SELECT p.patient_id, p.first_name, p.middle_name, p.last_name,
             p.date_of_birth, vp.age, p.gender, p.blood_group, p.email,
             p.street, p.city, p.state, p.pincode, p.registration_date, p.national_id,
             p.home_latitude, p.home_longitude, p.medical_profile,
             (p.photo IS NOT NULL) AS has_photo,
             ROUND(ST_Distance_Sphere(POINT(p.home_longitude, p.home_latitude),
                                      POINT(?, ?)) / 1000, 2) AS distance_km
      FROM patient p
      JOIN v_patient vp ON p.patient_id = vp.patient_id
      WHERE p.patient_id = ?
    `, [HOSPITAL_LNG, HOSPITAL_LAT, patientId]);

    if (patientRows.length > 0) {
      const patient = patientRows[0];
      const [phones] = await pool.query('SELECT phone FROM patient_phone WHERE patient_id = ?', [patientId]);
      const [contacts] = await pool.query('SELECT contact_name, relation_to_patient, phone, alt_phone FROM emergency_contact WHERE patient_id = ?', [patientId]);
      const [insurance] = await pool.query(`
        SELECT pi.provider_id, ip.provider_name, pi.policy_number, pi.plan_name, pi.coverage_limit, pi.valid_from, pi.valid_to
        FROM patient_insurance pi JOIN insurance_provider ip ON pi.provider_id = ip.provider_id WHERE pi.patient_id = ?
      `, [patientId]);
      const [appointments] = await pool.query(`
        SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.appointment_type, a.status, a.reason,
               d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, dep.dept_name
        FROM appointment a JOIN doctor d ON a.doctor_id = d.doctor_id JOIN department dep ON d.dept_id = dep.dept_id
        WHERE a.patient_id = ? ORDER BY a.appointment_date DESC
      `, [patientId]);
      const [bills] = await pool.query(`
        SELECT b.bill_id, b.bill_date, b.bill_type, b.payment_status, s.total_amount, s.amount_paid, s.balance_due
        FROM bill b JOIN v_bill_summary s ON b.bill_id = s.bill_id WHERE b.patient_id = ? ORDER BY b.bill_date DESC
      `, [patientId]);

      return res.json({
        ...patient,
        phones: phones.map(p => p.phone),
        emergency_contacts: contacts,
        insurance,
        appointments,
        bills
      });
    }
  } catch (err) {}

  // Sample fallback
  const sample = SAMPLE_PATIENTS.find(p => p.patient_id === patientId) || SAMPLE_PATIENTS[0];
  res.json({
    ...sample,
    emergency_contacts: [
      { contact_name: 'Family Contact', relation_to_patient: 'Family', phone: '9822200001', alt_phone: null }
    ],
    insurance: [
      { provider_id: 1, provider_name: 'Star Health', policy_number: 'SH-1001', plan_name: 'Family Floater', coverage_limit: 500000, valid_from: '2026-01-01', valid_to: '2026-12-31' }
    ],
    appointments: [
      { appointment_id: 1, appointment_date: '2026-10-01', appointment_time: '09:00', appointment_type: 'New', status: 'Completed', reason: 'Routine consultation', doctor_first_name: 'Rajesh', doctor_last_name: 'Sharma', dept_name: 'Cardiology' }
    ],
    bills: [
      { bill_id: 1, bill_date: '2026-10-01', bill_type: 'OPD', payment_status: 'Paid', total_amount: 1180, amount_paid: 1180, balance_due: 0 }
    ]
  });
});

// POST /api/patients (Register patient transaction)
router.post('/', verifyToken, allowRoles('Admin', 'Receptionist'), async (req, res, next) => {
  let conn = null;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const {
      first_name, middle_name, last_name, date_of_birth, gender, blood_group,
      email, street, city, state, pincode, registration_date, national_id,
      home_latitude, home_longitude, medical_profile, phones = [], emergency_contacts = []
    } = req.body;

    const [patientResult] = await conn.query(`
      INSERT INTO patient (
        first_name, middle_name, last_name, date_of_birth, gender, blood_group,
        email, street, city, state, pincode, registration_date, national_id,
        home_latitude, home_longitude, medical_profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, middle_name || null, last_name, date_of_birth, gender, blood_group || null,
      email || null, street, city, state, pincode, registration_date || new Date().toISOString().slice(0, 10),
      national_id || null, home_latitude != null ? home_latitude : null, home_longitude != null ? home_longitude : null,
      medical_profile ? (typeof medical_profile === 'string' ? medical_profile : JSON.stringify(medical_profile)) : null
    ]);

    const newPatientId = patientResult.insertId;

    for (const phone of phones) {
      if (phone && phone.trim()) {
        await conn.query('INSERT INTO patient_phone (patient_id, phone) VALUES (?, ?)', [newPatientId, phone.trim()]);
      }
    }

    for (const contact of emergency_contacts) {
      if (contact.contact_name && contact.phone) {
        await conn.query(`
          INSERT INTO emergency_contact (patient_id, contact_name, relation_to_patient, phone, alt_phone)
          VALUES (?, ?, ?, ?, ?)
        `, [newPatientId, contact.contact_name, contact.relation_to_patient || 'Other', contact.phone, contact.alt_phone || null]);
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Patient registered successfully.', patient_id: newPatientId });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/patients/:id/photo
router.get('/:id/photo', async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    const [rows] = await pool.query('SELECT photo, photo_mime FROM patient WHERE patient_id = ?', [patientId]);
    if (rows.length > 0 && rows[0].photo) {
      res.setHeader('Content-Type', rows[0].photo_mime || 'image/jpeg');
      return res.end(rows[0].photo);
    }
  } catch (e) {}
  res.status(404).json({ message: 'No photo found' });
});

// PUT /api/patients/:id/photo
router.put('/:id/photo', verifyToken, allowRoles('Admin', 'Receptionist'), upload.single('photo'), async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await pool.query('UPDATE patient SET photo = ?, photo_mime = ? WHERE patient_id = ?', [req.file.buffer, req.file.mimetype, patientId]);
    res.json({ message: 'Photo uploaded successfully.', size_bytes: req.file.size });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/patients/:id/medical-profile
router.patch('/:id/medical-profile', verifyToken, allowRoles('Admin', 'Doctor', 'Receptionist'), async (req, res, next) => {
  try {
    const patientId = parseInt(req.params.id, 10);
    const { medical_profile } = req.body;
    const jsonString = typeof medical_profile === 'string' ? medical_profile : JSON.stringify(medical_profile);
    await pool.query('UPDATE patient SET medical_profile = ? WHERE patient_id = ?', [jsonString, patientId]);
    res.json({ message: 'Medical profile updated successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
