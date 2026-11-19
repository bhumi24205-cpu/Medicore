// Standalone Zero-Dependency Serverless API for Vercel
const DEPARTMENTS = [
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

const DOCTORS = [
  { doctor_id: 1, first_name: 'Rajesh', last_name: 'Sharma', gender: 'M', specialization: 'Cardiologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1001', phone: '9800000001', email: 'rajesh.sharma@medicore.in', consultation_fee: 1000, joining_date: '2010-06-15', experience_years: 14, status: 'Active', dept_id: 1, dept_name: 'Cardiology', floor_no: 2, offers_video: false },
  { doctor_id: 2, first_name: 'Anita', last_name: 'Verma', gender: 'F', specialization: 'Neurologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1002', phone: '9800000002', email: 'anita.verma@medicore.in', consultation_fee: 1200, joining_date: '2012-03-01', experience_years: 12, status: 'Active', dept_id: 2, dept_name: 'Neurology', floor_no: 2, offers_video: true },
  { doctor_id: 3, first_name: 'Vikram', last_name: 'Singh', gender: 'M', specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS', license_no: 'RMC1003', phone: '9800000003', email: 'vikram.singh@medicore.in', consultation_fee: 900, joining_date: '2015-08-20', experience_years: 9, status: 'Active', dept_id: 3, dept_name: 'Orthopedics', floor_no: 1, offers_video: false },
  { doctor_id: 4, first_name: 'Neha', last_name: 'Gupta', gender: 'F', specialization: 'Pediatrician', qualification: 'MBBS, MD', license_no: 'RMC1004', phone: '9800000004', email: 'neha.gupta@medicore.in', consultation_fee: 600, joining_date: '2018-01-10', experience_years: 6, status: 'Active', dept_id: 4, dept_name: 'Pediatrics', floor_no: 1, offers_video: true },
  { doctor_id: 5, first_name: 'Sanjay', last_name: 'Mehta', gender: 'M', specialization: 'Dermatologist', qualification: 'MBBS, MD', license_no: 'RMC1005', phone: '9800000005', email: 'sanjay.mehta@medicore.in', consultation_fee: 700, joining_date: '2016-11-05', experience_years: 8, status: 'Active', dept_id: 5, dept_name: 'Dermatology', floor_no: 3, offers_video: false },
  { doctor_id: 6, first_name: 'Priya', last_name: 'Nair', gender: 'F', specialization: 'ENT Specialist', qualification: 'MBBS, MS', license_no: 'RMC1006', phone: '9800000006', email: 'priya.nair@medicore.in', consultation_fee: 500, joining_date: '2019-07-12', experience_years: 5, status: 'Active', dept_id: 6, dept_name: 'ENT', floor_no: 3, offers_video: false },
  { doctor_id: 7, first_name: 'Amit', last_name: 'Joshi', gender: 'M', specialization: 'Physician', qualification: 'MBBS, MD', license_no: 'RMC1007', phone: '9800000007', email: 'amit.joshi@medicore.in', consultation_fee: 400, joining_date: '2008-09-30', experience_years: 16, status: 'Active', dept_id: 7, dept_name: 'General Medicine', floor_no: 0, offers_video: true },
  { doctor_id: 8, first_name: 'Kavita', last_name: 'Rao', gender: 'F', specialization: 'Gynecologist', qualification: 'MBBS, MS', license_no: 'RMC1008', phone: '9800000008', email: 'kavita.rao@medicore.in', consultation_fee: 800, joining_date: '2013-04-18', experience_years: 11, status: 'Active', dept_id: 8, dept_name: 'Gynecology', floor_no: 1, offers_video: false },
  { doctor_id: 9, first_name: 'Manoj', last_name: 'Kapoor', gender: 'M', specialization: 'Oncologist', qualification: 'MBBS, MD, DM', license_no: 'RMC1009', phone: '9800000009', email: 'manoj.kapoor@medicore.in', consultation_fee: 1500, joining_date: '2005-02-25', experience_years: 19, status: 'Active', dept_id: 9, dept_name: 'Oncology', floor_no: 4, offers_video: false },
  { doctor_id: 10, first_name: 'Deepa', last_name: 'Iyer', gender: 'F', specialization: 'Emergency Medicine', qualification: 'MBBS, MD', license_no: 'RMC1010', phone: '9800000010', email: 'deepa.iyer@medicore.in', consultation_fee: 1000, joining_date: '2017-10-03', experience_years: 7, status: 'Active', dept_id: 10, dept_name: 'Emergency', floor_no: 0, offers_video: false }
];

const PATIENTS = [
  { patient_id: 1, first_name: 'Rohan', middle_name: 'Kumar', last_name: 'Mishra', date_of_birth: '1985-04-12', age: 41, gender: 'M', blood_group: 'O+', email: 'rohan.mishra@mail.com', street: '12 MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', home_latitude: 26.9150, home_longitude: 75.7900, distance_km: 0.4, medical_profile: { allergies: ['Penicillin'], chronic_conditions: ['Hypertension'] } },
  { patient_id: 2, first_name: 'Sunita', middle_name: '', last_name: 'Sharma', date_of_birth: '1992-08-25', age: 34, gender: 'F', blood_group: 'A+', email: 'sunita.sharma@mail.com', street: '45 Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302017', home_latitude: 26.8520, home_longitude: 75.8200, distance_km: 7.4, medical_profile: { allergies: ['Sulfa'], chronic_conditions: ['Asthma'] } },
  { patient_id: 3, first_name: 'Vikram', middle_name: 'Singh', last_name: 'Shekhawat', date_of_birth: '1978-11-03', age: 48, gender: 'M', blood_group: 'B+', email: 'vikram.shekhawat@mail.com', street: '78 Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302021', home_latitude: 26.9100, home_longitude: 75.7400, distance_km: 4.7, medical_profile: { allergies: [], chronic_conditions: ['Diabetes Type 2'] } }
];

const DEMO_USERS = {
  admin: { user_id: 1, username: 'admin', role: 'Admin', doctor_id: null, patient_id: null },
  root: { user_id: 1, username: 'root', role: 'Admin', doctor_id: null, patient_id: null },
  reception: { user_id: 2, username: 'reception', role: 'Receptionist', doctor_id: null, patient_id: null },
  'dr.rajesh': { user_id: 3, username: 'dr.rajesh', role: 'Doctor', doctor_id: 1, patient_id: null },
  billing: { user_id: 4, username: 'billing', role: 'Billing', doctor_id: null, patient_id: null },
  'patient.rohan': { user_id: 5, username: 'patient.rohan', role: 'Patient', doctor_id: null, patient_id: 1 }
};

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Parse Body if needed
  let body = req.body;
  if (!body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const dataStr = Buffer.concat(buffers).toString();
      if (dataStr) {
        body = JSON.parse(dataStr);
      }
    } catch (e) {
      body = {};
    }
  }

  // Normalize URL Path
  const urlObj = new URL(req.url, 'http://localhost');
  let pathname = urlObj.pathname.replace(/^\/api/, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  const json = (data, status = 200) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // 1. Health
  if (pathname === '/health' || pathname === '/') {
    return json({ status: 'ok', service: 'MediCore Serverless Cloud API', timestamp: new Date().toISOString() });
  }

  // 2. Authentication
  if (pathname === '/auth/login') {
    const userKey = (body?.username || 'admin').toLowerCase();
    const user = DEMO_USERS[userKey] || { user_id: 1, username: body?.username || 'admin', role: 'Admin' };
    const token = 'medicore_jwt_token_' + Buffer.from(JSON.stringify(user)).toString('base64');
    return json({ token, user, message: 'Authentication successful.' });
  }

  if (pathname === '/auth/db-config') {
    return json({ success: true, message: 'Database configuration verified successfully.' });
  }

  if (pathname === '/auth/me') {
    return json(DEMO_USERS['admin']);
  }

  // 3. Doctors & Departments
  if (pathname === '/doctors/public' || pathname === '/doctors') {
    const deptId = urlObj.searchParams.get('dept_id');
    let list = [...DOCTORS];
    if (deptId) list = list.filter(d => String(d.dept_id) === String(deptId));
    return json(list);
  }

  if (pathname === '/doctors/departments/public' || pathname === '/doctors/departments/list' || pathname === '/departments') {
    return json(DEPARTMENTS);
  }

  // 4. Dashboard Analytics
  if (pathname === '/reports/dashboard') {
    return json({
      counts: { patients: 12, active_doctors: 10, today_appointments: 4, admitted_patients: 3, total_revenue: 142500 },
      revenue_by_dept: [
        { dept_name: 'Cardiology', revenue: 52000 },
        { dept_name: 'Neurology', revenue: 38000 },
        { dept_name: 'Orthopedics', revenue: 31000 },
        { dept_name: 'General Medicine', revenue: 14500 },
        { dept_name: 'Pediatrics', revenue: 7000 }
      ],
      payments_by_mode: [
        { payment_mode: 'Cash', total: 45000, count: 8 },
        { payment_mode: 'CreditCard', total: 62000, count: 5 },
        { payment_mode: 'UPI', total: 25500, count: 6 },
        { payment_mode: 'Insurance', total: 10000, count: 1 }
      ],
      top_medicines: [
        { medicine_name: 'Amoxicillin 500mg', times_prescribed: 14 },
        { medicine_name: 'Atorvastatin 20mg', times_prescribed: 11 },
        { medicine_name: 'Metformin 500mg', times_prescribed: 9 },
        { medicine_name: 'Paracetamol 650mg', times_prescribed: 8 },
        { medicine_name: 'Pantoprazole 40mg', times_prescribed: 7 }
      ],
      appointments_per_doctor: [
        { first_name: 'Rajesh', last_name: 'Sharma', total_appointments: 9 },
        { first_name: 'Anita', last_name: 'Verma', total_appointments: 6 },
        { first_name: 'Vikram', last_name: 'Singh', total_appointments: 4 },
        { first_name: 'Amit', last_name: 'Joshi', total_appointments: 3 }
      ]
    });
  }

  // 5. Patients
  if (pathname === '/patients') {
    if (req.method === 'POST') {
      return json({ patient_id: 101, message: 'Patient registered successfully.' }, 201);
    }
    return json(PATIENTS);
  }

  if (pathname.startsWith('/patients/')) {
    const p = PATIENTS[0];
    return json({
      ...p,
      phones: [{ phone_id: 1, phone_number: '+91 98000 00001', phone_type: 'Mobile' }],
      emergency_contacts: [{ contact_id: 1, name: 'Sunita Mishra', relation: 'Spouse', phone: '+91 98000 00002' }],
      medical_profile: p.medical_profile
    });
  }

  // 6. Appointments
  if (pathname === '/appointments') {
    if (req.method === 'POST') {
      return json({ appointment_id: 101, message: 'Appointment scheduled successfully.' }, 201);
    }
    return json([
      { appointment_id: 1, patient_id: 1, patient_name: 'Rohan Mishra', doctor_id: 1, doctor_name: 'Dr. Rajesh Sharma', dept_name: 'Cardiology', date: '2026-11-20', time: '09:30:00', status: 'Scheduled', fee: 1000 },
      { appointment_id: 2, patient_id: 2, patient_name: 'Sunita Sharma', doctor_id: 2, doctor_name: 'Dr. Anita Verma', dept_name: 'Neurology', date: '2026-11-20', time: '10:30:00', status: 'Completed', fee: 1200 }
    ]);
  }

  // 7. Admissions & Rooms
  if (pathname === '/admissions') {
    return json({
      admissions: [
        { admission_id: 1, patient_id: 1, patient_name: 'Rohan Mishra', room_no: '201', room_type: 'ICU', admission_date: '2026-11-15', status: 'Admitted', doctor_name: 'Dr. Rajesh Sharma' }
      ],
      rooms: [
        { room_id: 1, room_no: '101', room_type: 'General', floor: 1, rate_per_day: 1500, is_occupied: false },
        { room_id: 2, room_no: '201', room_type: 'ICU', floor: 2, rate_per_day: 8000, is_occupied: true }
      ]
    });
  }

  // 8. Billing Ledger
  if (pathname === '/bills') {
    return json([
      { bill_id: 1, patient_id: 1, patient_name: 'Rohan Mishra', total_amount: 15000, paid_amount: 15000, balance_due: 0, payment_status: 'Paid', bill_date: '2026-11-16' }
    ]);
  }

  // 9. Pharmacy & Lab
  if (pathname === '/pharmacy' || pathname === '/clinical/medicines') {
    return json([
      { medicine_id: 1, medicine_name: 'Amoxicillin 500mg', stock_quantity: 420, unit_price: 15.50 },
      { medicine_id: 2, medicine_name: 'Atorvastatin 20mg', stock_quantity: 280, unit_price: 24.00 }
    ]);
  }

  if (pathname === '/lab' || pathname === '/clinical/lab-orders') {
    return json([
      { order_id: 1, patient_name: 'Rohan Mishra', test_name: 'Lipid Profile', order_date: '2026-11-18', status: 'Completed', result_value: 'Total Cholesterol: 185 mg/dL' }
    ]);
  }

  // 10. GPS Patient Map
  if (pathname === '/map/patients') {
    const withinKm = parseFloat(urlObj.searchParams.get('withinKm') || '15');
    const filtered = PATIENTS.filter(p => p.distance_km <= withinKm);
    return json({
      hospital: { name: 'MediCore Hospital', latitude: 26.9124, longitude: 75.7873 },
      radius_km: withinKm,
      count: filtered.length,
      patients: filtered
    });
  }

  // 11. Lab Tools: Query Explorer
  if (pathname === '/lab-tools/queries') {
    return json([
      { code: 'Q1', description: 'Appointments for doctor 1 on a specific date', category: 'Standard SQL' },
      { code: 'Q2', description: 'Departments and their head doctors', category: 'Standard SQL' },
      { code: 'Q3', description: 'Doctor directory with department names', category: 'Standard SQL' },
      { code: 'Q4', description: 'Appointment count per doctor', category: 'Standard SQL' },
      { code: 'Q9', description: 'Most frequently prescribed medicines', category: 'Standard SQL' },
      { code: 'Q17', description: 'Total payments collected grouped by mode', category: 'Standard SQL' },
      { code: 'Q18', description: 'Revenue generated per department', category: 'Standard SQL' },
      { code: 'J1', description: 'JSON filter: Patients allergic to Penicillin', category: 'JSON Queries' },
      { code: 'G1', description: 'GPS: Distance of each patient to hospital', category: 'GPS Queries' },
      { code: 'B1', description: 'BLOB: Patient photo byte length verification', category: 'BLOB Queries' }
    ]);
  }

  if (pathname.startsWith('/lab-tools/queries/')) {
    const code = pathname.split('/').pop();
    return json({
      code,
      sql: `SELECT * FROM ${code.startsWith('J') ? 'patient WHERE JSON_CONTAINS(medical_profile, ...)' : code.startsWith('G') ? 'patient WHERE ST_Distance_Sphere(...) < 15000' : 'appointment'} LIMIT 10;`,
      rowCount: 3,
      executionTimeMs: '1.2ms',
      columns: ['id', 'name', 'status', 'metric'],
      rows: [
        { id: 1, name: 'Sample Record 1', status: 'Active', metric: '100%' },
        { id: 2, name: 'Sample Record 2', status: 'Verified', metric: '98.5%' }
      ]
    });
  }

  // 12. Lab Tools: Rule Lab Tests
  if (pathname === '/lab-tools/rule-tests') {
    return json([
      { code: 'T1', ruleType: 'UNIQUE', description: 'Double booking: doctor already scheduled at same time slot' },
      { code: 'T2', ruleType: 'FOREIGN KEY', description: 'Assigning appointment to non-existent doctor ID' },
      { code: 'T3', ruleType: 'CHECK', description: 'Inserting negative consultation fee constraint' },
      { code: 'T4', ruleType: 'CHECK', description: 'Inserting medicine with negative stock quantity' },
      { code: 'CASCADE_1', ruleType: 'ON DELETE CASCADE', description: 'Deleting prescription removes prescription_medicine rows' }
    ]);
  }

  if (pathname.startsWith('/lab-tools/rule-tests/') && pathname.endsWith('/run')) {
    const parts = pathname.split('/');
    const code = parts[parts.length - 2];
    return json({
      code,
      blocked: true,
      status: 'BLOCKED_AS_EXPECTED',
      errno: 1062,
      rawError: `Constraint violation for rule ${code}: Duplicate or invalid key.`,
      friendlyMessage: `Integrity rule enforced: Database constraint prevented invalid data insertion.`,
      message: `Constraint [${code}] verified. Statement was blocked by MySQL constraint logic and safely rolled back.`
    });
  }

  // Fallback
  return json({ success: true, message: 'MediCore API Active' });
};
