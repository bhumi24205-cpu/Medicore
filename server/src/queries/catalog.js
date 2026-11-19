const fs = require('fs');
const path = require('path');

const SQL_DIR = path.join(__dirname, 'sql');
if (!fs.existsSync(SQL_DIR)) {
  fs.mkdirSync(SQL_DIR, { recursive: true });
}

const TEST_QUERIES = [
  {
    code: 'Q1',
    category: 'Standard SQL',
    description: 'Simple SELECT with WHERE: all active doctors',
    sql: `SELECT doctor_id, first_name, last_name, specialization
FROM doctor
WHERE status = 'Active';`
  },
  {
    code: 'Q2',
    category: 'Standard SQL',
    description: 'JOIN: each doctor with the department name',
    sql: `SELECT d.first_name, d.last_name, dep.dept_name
FROM doctor d
JOIN department dep ON d.dept_id = dep.dept_id;`
  },
  {
    code: 'Q3',
    category: 'Standard SQL',
    description: 'JOIN: which doctor heads which department',
    sql: `SELECT dep.dept_name, d.first_name AS head_first_name, d.last_name AS head_last_name
FROM department dep
JOIN doctor d ON dep.head_doctor_id = d.doctor_id;`
  },
  {
    code: 'Q4',
    category: 'Standard SQL',
    description: 'GROUP BY: number of appointments per doctor',
    sql: `SELECT d.first_name, d.last_name, COUNT(a.appointment_id) AS total_appointments
FROM doctor d
LEFT JOIN appointment a ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
ORDER BY total_appointments DESC;`
  },
  {
    code: 'Q5',
    category: 'Standard SQL',
    description: "Today's / upcoming scheduled appointments with patient and doctor names",
    sql: `SELECT a.appointment_date, a.appointment_time,
       p.first_name AS patient, d.first_name AS doctor, a.reason
FROM appointment a
JOIN patient p ON a.patient_id = p.patient_id
JOIN doctor d  ON a.doctor_id = d.doctor_id
WHERE a.status = 'Scheduled'
ORDER BY a.appointment_date, a.appointment_time;`
  },
  {
    code: 'Q6',
    category: 'Standard SQL',
    description: 'Multivalued attribute: all phone numbers of each patient',
    sql: `SELECT p.first_name, p.last_name, ph.phone
FROM patient p
JOIN patient_phone ph ON p.patient_id = ph.patient_id
ORDER BY p.patient_id;`
  },
  {
    code: 'Q7',
    category: 'Standard SQL',
    description: 'Weak entity: emergency contacts of patient 1',
    sql: `SELECT p.first_name, ec.contact_name, ec.relation_to_patient, ec.phone
FROM patient p
JOIN emergency_contact ec ON p.patient_id = ec.patient_id
WHERE p.patient_id = 1;`
  },
  {
    code: 'Q8',
    category: 'Standard SQL',
    description: 'Many-to-many: medicines in each prescription with dosage',
    sql: `SELECT pr.prescription_id, p.first_name AS patient, m.medicine_name, pm.dosage, pm.frequency, pm.duration_days
FROM prescription pr
JOIN appointment a ON pr.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN prescription_medicine pm ON pr.prescription_id = pm.prescription_id
JOIN medicine m ON pm.medicine_id = m.medicine_id
ORDER BY pr.prescription_id;`
  },
  {
    code: 'Q9',
    category: 'Standard SQL',
    description: 'Most prescribed medicines (GROUP BY and COUNT)',
    sql: `SELECT m.medicine_name, COUNT(*) AS times_prescribed
FROM prescription_medicine pm
JOIN medicine m ON pm.medicine_id = m.medicine_id
GROUP BY m.medicine_id, m.medicine_name
ORDER BY times_prescribed DESC;`
  },
  {
    code: 'Q10',
    category: 'Standard SQL',
    description: 'Lab results of every patient',
    sql: `SELECT p.first_name, lt.test_name, lot.result_value, lot.result_status
FROM lab_order_test lot
JOIN lab_order lo ON lot.lab_order_id = lo.lab_order_id
JOIN appointment a ON lo.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN lab_test lt ON lot.test_id = lt.test_id
ORDER BY p.patient_id;`
  },
  {
    code: 'Q11',
    category: 'Standard SQL',
    description: 'Patients currently admitted, with room and doctor',
    sql: `SELECT p.first_name, p.last_name, r.room_number, r.room_type, d.first_name AS doctor
FROM admission ad
JOIN patient p ON ad.patient_id = p.patient_id
JOIN room r    ON ad.room_id = r.room_id
JOIN doctor d  ON ad.doctor_id = d.doctor_id
WHERE ad.status = 'Admitted';`
  },
  {
    code: 'Q12',
    category: 'Views (Derived Attributes)',
    description: 'Derived attribute: patient age (view v_patient)',
    sql: `SELECT patient_id, first_name, date_of_birth, age FROM v_patient;`
  },
  {
    code: 'Q13',
    category: 'Views (Derived Attributes)',
    description: 'Derived attribute: doctor experience (view v_doctor)',
    sql: `SELECT doctor_id, first_name, specialization, experience_years FROM v_doctor;`
  },
  {
    code: 'Q14',
    category: 'Views (Derived Attributes)',
    description: 'Derived attribute: length of stay (view v_admission)',
    sql: `SELECT admission_id, patient_id, admission_date, discharge_date, length_of_stay FROM v_admission;`
  },
  {
    code: 'Q15',
    category: 'Views (Derived Attributes)',
    description: 'Derived attributes: bill total, paid and balance (view v_bill_summary)',
    sql: `SELECT * FROM v_bill_summary;`
  },
  {
    code: 'Q16',
    category: 'Standard SQL',
    description: 'Unpaid or partly paid bills with the balance still due',
    sql: `SELECT bill_id, patient_id, total_amount, amount_paid, balance_due
FROM v_bill_summary
WHERE balance_due > 0;`
  },
  {
    code: 'Q17',
    category: 'Standard SQL',
    description: 'Total money received per payment mode',
    sql: `SELECT payment_mode, COUNT(*) AS payments, SUM(amount) AS total_received
FROM payment
GROUP BY payment_mode;`
  },
  {
    code: 'Q18',
    category: 'Standard SQL',
    description: 'Total revenue per department (appointment bills only, items only)',
    sql: `SELECT dep.dept_name, SUM(bi.quantity * bi.unit_price) AS revenue
FROM bill b
JOIN appointment a ON b.appointment_id = a.appointment_id
JOIN doctor d ON a.doctor_id = d.doctor_id
JOIN department dep ON d.dept_id = dep.dept_id
JOIN bill_item bi ON b.bill_id = bi.bill_id
GROUP BY dep.dept_id, dep.dept_name
ORDER BY revenue DESC;`
  },
  {
    code: 'Q19',
    category: 'Standard SQL',
    description: 'Patients with insurance and the provider name',
    sql: `SELECT p.first_name, p.last_name, ip.provider_name, pi.policy_number, pi.coverage_limit
FROM patient_insurance pi
JOIN patient p ON pi.patient_id = p.patient_id
JOIN insurance_provider ip ON pi.provider_id = ip.provider_id;`
  },
  {
    code: 'Q20',
    category: 'Standard SQL',
    description: 'Patients with NO insurance (LEFT JOIN, find NULLs)',
    sql: `SELECT p.patient_id, p.first_name, p.last_name
FROM patient p
LEFT JOIN patient_insurance pi ON p.patient_id = pi.patient_id
WHERE pi.patient_id IS NULL;`
  },
  {
    code: 'Q21',
    category: 'Subqueries & Aggregates',
    description: 'Subquery: patients who spent more than the average bill',
    sql: `SELECT p.first_name, p.last_name, s.total_amount
FROM v_bill_summary s
JOIN patient p ON s.patient_id = p.patient_id
WHERE s.total_amount > (SELECT AVG(total_amount) FROM v_bill_summary);`
  },
  {
    code: 'Q22',
    category: 'Subqueries & Aggregates',
    description: 'HAVING: doctors with 2 or more appointments',
    sql: `SELECT d.first_name, d.last_name, COUNT(*) AS total
FROM appointment a
JOIN doctor d ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
HAVING COUNT(*) >= 2;`
  },
  {
    code: 'J1',
    category: 'JSON Queries',
    description: 'Patients who are allergic to Penicillin',
    sql: `SELECT patient_id, first_name, medical_profile
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Penicillin"', '$.allergies');`
  },
  {
    code: 'J2',
    category: 'JSON Queries',
    description: 'Patients with Diabetes as a chronic condition',
    sql: `SELECT patient_id, first_name, medical_profile->>'$.chronic' AS chronic_conditions
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Diabetes"', '$.chronic');`
  },
  {
    code: 'J3',
    category: 'JSON Queries',
    description: 'Hemoglobin value stored inside the lab result JSON',
    sql: `SELECT lab_order_id, test_id, extra_results->>'$.hemoglobin' AS hemoglobin
FROM lab_order_test
WHERE extra_results IS NOT NULL AND extra_results->>'$.hemoglobin' IS NOT NULL;`
  },
  {
    code: 'J4',
    category: 'JSON Queries',
    description: 'Doctors who offer video consultation',
    sql: `SELECT doctor_id, day_of_week, slot_config->>'$.modes' AS modes
FROM doctor_schedule
WHERE JSON_CONTAINS(slot_config->'$.modes', '"video"');`
  },
  {
    code: 'G1',
    category: 'GPS Queries',
    description: "Distance of every patient's home from the hospital, in km (Jaipur 26.9124, 75.7873)",
    sql: `SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
ORDER BY distance_km;`
  },
  {
    code: 'G2',
    category: 'GPS Queries',
    description: 'Patients living within 5 km of the hospital',
    sql: `SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
WHERE ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                         POINT(75.7873, 26.9124)) <= 5000;`
  },
  {
    code: 'B1',
    category: 'BLOB Queries',
    description: 'Which patients have a photo, and how big is it (in bytes)',
    sql: `SELECT patient_id, first_name, LENGTH(photo) AS photo_bytes
FROM patient
WHERE photo IS NOT NULL;`
  },
  {
    code: 'B2',
    category: 'BLOB Queries',
    description: 'Which lab results have a report image',
    sql: `SELECT lab_order_id, test_id, LENGTH(report_image) AS image_bytes
FROM lab_order_test
WHERE report_image IS NOT NULL;`
  }
];

const RULE_TESTS = [
  {
    code: 'T1',
    ruleType: 'UNIQUE',
    description: 'Double booking: doctor 1 already has an appointment on 2026-10-01 at 09:00',
    expectedOutcome: 'FAIL (Blocked by UNIQUE constraint on doctor_id, date, time)',
    sql: `INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (3, 1, '2026-10-01', '09:00', 'Test double booking');`
  },
  {
    code: 'T2',
    ruleType: 'UNIQUE',
    description: 'A second prescription for the same appointment (appointment 1)',
    expectedOutcome: 'FAIL (Blocked by UNIQUE constraint on prescription.appointment_id)',
    sql: `INSERT INTO prescription (appointment_id, prescription_date, diagnosis)
VALUES (1, '2026-10-01', 'Duplicate prescription');`
  },
  {
    code: 'T3',
    ruleType: 'FOREIGN KEY',
    description: 'Appointment for a patient that does not exist (patient_id = 999)',
    expectedOutcome: 'FAIL (Blocked by FK reference to patient.patient_id)',
    sql: `INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (999, 1, '2026-12-01', '09:00', 'Unknown patient');`
  },
  {
    code: 'T4',
    ruleType: 'UNIQUE',
    description: 'Duplicate doctor email (rajesh.sharma@medicore.in)',
    expectedOutcome: 'FAIL (Blocked by UNIQUE constraint on doctor.email)',
    sql: `INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, dept_id)
VALUES ('Test', 'Doctor', 'M', 'General', 'MBBS', 'RMC9999', '9800009999', 'rajesh.sharma@medicore.in', 500, '2025-01-01', 1);`
  },
  {
    code: 'T5',
    ruleType: 'CHECK',
    description: 'Negative consultation fee (-100)',
    expectedOutcome: 'FAIL (Blocked by CHECK constraint consultation_fee >= 0)',
    sql: `INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, dept_id)
VALUES ('Test', 'Doctor', 'M', 'General', 'MBBS', 'RMC9998', '9800009998', 'test@medicore.in', -100, '2025-01-01', 1);`
  },
  {
    code: 'T6',
    ruleType: 'CHECK',
    description: "Invalid appointment status ('Maybe')",
    expectedOutcome: "FAIL (Blocked by CHECK status IN ('Scheduled','Completed','Cancelled','No-Show'))",
    sql: `INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
VALUES (3, 2, '2026-12-01', '09:00', 'Maybe', 'Bad status');`
  },
  {
    code: 'T7',
    ruleType: 'CHECK',
    description: 'Discharge date before admission date',
    expectedOutcome: 'FAIL (Blocked by CHECK discharge_date >= admission_date)',
    sql: `INSERT INTO admission (patient_id, room_id, doctor_id, admission_date, discharge_date, admission_type, diagnosis, status)
VALUES (3, 1, 3, '2026-11-01 10:00:00', '2026-10-01 10:00:00', 'Planned', 'Test', 'Discharged');`
  },
  {
    code: 'T8',
    ruleType: 'CHECK',
    description: 'A bill with neither appointment nor admission (both NULL)',
    expectedOutcome: 'FAIL (Blocked by CHECK appointment_id IS NOT NULL OR admission_id IS NOT NULL)',
    sql: `INSERT INTO bill (patient_id, appointment_id, admission_id, bill_date, bill_type)
VALUES (1, NULL, NULL, '2026-11-05', 'OPD');`
  },
  {
    code: 'T9',
    ruleType: 'UNIQUE',
    description: 'Two bills for the same appointment (appointment 1 already billed)',
    expectedOutcome: 'FAIL (Blocked by UNIQUE constraint on bill.appointment_id)',
    sql: `INSERT INTO bill (patient_id, appointment_id, bill_date, bill_type)
VALUES (1, 1, '2026-11-05', 'OPD');`
  },
  {
    code: 'T10',
    ruleType: 'CHECK',
    description: 'Payment of zero rupees (amount = 0)',
    expectedOutcome: 'FAIL (Blocked by CHECK payment.amount > 0)',
    sql: `INSERT INTO payment (bill_id, payment_date, amount, payment_mode)
VALUES (3, '2026-11-05 10:00:00', 0, 'Cash');`
  },
  {
    code: 'T11',
    ruleType: 'CHECK',
    description: "Invalid payment mode ('Bitcoin')",
    expectedOutcome: "FAIL (Blocked by CHECK payment_mode IN ('Cash','Card','UPI','NetBanking','Insurance'))",
    sql: `INSERT INTO payment (bill_id, payment_date, amount, payment_mode)
VALUES (3, '2026-11-05 10:00:00', 500, 'Bitcoin');`
  },
  {
    code: 'T12',
    ruleType: 'CHECK',
    description: 'Invalid latitude (120.5 - must be between -90 and 90)',
    expectedOutcome: 'FAIL (Blocked by CHECK home_latitude BETWEEN -90 AND 90)',
    sql: `INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date, home_latitude, home_longitude)
VALUES ('Test', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05', 120.5, 75.8);`
  },
  {
    code: 'T13',
    ruleType: 'FOREIGN KEY (RESTRICT)',
    description: 'Deleting a doctor who has appointments (doctor_id = 1)',
    expectedOutcome: 'FAIL (Blocked by foreign key RESTRICT on appointment.doctor_id)',
    sql: `DELETE FROM doctor WHERE doctor_id = 1;`
  },
  {
    code: 'T14',
    ruleType: 'FOREIGN KEY (RESTRICT)',
    description: 'Deleting a patient who has appointments (patient_id = 1)',
    expectedOutcome: 'FAIL (Blocked by foreign key RESTRICT on appointment.patient_id)',
    sql: `DELETE FROM patient WHERE patient_id = 1;`
  },
  {
    code: 'T15',
    ruleType: 'UNIQUE',
    description: 'Two departments with the same head doctor (head_doctor_id = 1)',
    expectedOutcome: 'FAIL (Blocked by UNIQUE constraint on department.head_doctor_id)',
    sql: `UPDATE department SET head_doctor_id = 1 WHERE dept_id = 2;`
  },
  {
    code: 'T16',
    ruleType: 'JSON VALIDATION',
    description: 'Invalid JSON text in a JSON column',
    expectedOutcome: 'FAIL (Blocked by MySQL JSON syntax validator - error 3140)',
    sql: `UPDATE patient SET medical_profile = '{allergies: broken' WHERE patient_id = 1;`
  },
  {
    code: 'CASCADE_1',
    ruleType: 'CASCADE DELETE',
    description: 'Deleting a bill cascades and automatically deletes its bill_items',
    expectedOutcome: 'SUCCEED then ROLLBACK (Items deleted via CASCADE on bill_id)',
    sql: `START TRANSACTION;
  SELECT COUNT(*) AS items_before FROM bill_item WHERE bill_id = 3;
  DELETE FROM bill WHERE bill_id = 3;
  SELECT COUNT(*) AS items_after_delete FROM bill_item WHERE bill_id = 3;
ROLLBACK;`
  },
  {
    code: 'CASCADE_2',
    ruleType: 'CASCADE DELETE',
    description: 'Deleting a patient cascades and automatically deletes their patient_phones',
    expectedOutcome: 'SUCCEED then ROLLBACK (Phones deleted via CASCADE on patient_id)',
    sql: `START TRANSACTION;
  INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date)
  VALUES ('Temp', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05');
  SET @new_id = LAST_INSERT_ID();
  INSERT INTO patient_phone (patient_id, phone) VALUES (@new_id, '9000000000');
  SELECT COUNT(*) AS phones_before FROM patient_phone WHERE patient_id = @new_id;
  DELETE FROM patient WHERE patient_id = @new_id;
  SELECT COUNT(*) AS phones_after_delete FROM patient_phone WHERE patient_id = @new_id;
ROLLBACK;`
  }
];

// Write all queries to individual files in sql/ directory
[...TEST_QUERIES, ...RULE_TESTS].forEach(q => {
  const filePath = path.join(SQL_DIR, `${q.code}.sql`);
  const content = `-- ${q.code}: ${q.description}\n${q.sql}\n`;
  fs.writeFileSync(filePath, content, 'utf8');
});

module.exports = {
  TEST_QUERIES,
  RULE_TESTS
};
