-- =====================================================================
-- MediCore sample data  (run AFTER medicore_schema.sql)
-- Insert order follows the foreign keys: parents first, children later.
-- =====================================================================
USE medicore_transactional;

-- ---------- DEPARTMENT (head doctor is filled in later) ----------
INSERT INTO department (dept_name, floor_no, phone_ext) VALUES
('Cardiology',      2, '201'),
('Neurology',       2, '202'),
('Orthopedics',     1, '101'),
('Pediatrics',      1, '102'),
('Dermatology',     3, '301'),
('ENT',             3, '302'),
('General Medicine',0, '001'),
('Gynecology',      1, '103'),
('Oncology',        4, '401'),
('Emergency',       0, '002');

-- ---------- DOCTOR (one doctor per department) ----------
INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, status, dept_id) VALUES
('Rajesh',  'Sharma', 'M', 'Cardiologist',      'MBBS, MD, DM',   'RMC1001', '9800000001', 'rajesh.sharma@medicore.in', 1000, '2010-06-15', 'Active',  1),
('Anita',   'Verma',  'F', 'Neurologist',       'MBBS, MD, DM',   'RMC1002', '9800000002', 'anita.verma@medicore.in',   1200, '2012-03-01', 'Active',  2),
('Vikram',  'Singh',  'M', 'Orthopedic Surgeon','MBBS, MS',       'RMC1003', '9800000003', 'vikram.singh@medicore.in',   900, '2015-08-20', 'Active',  3),
('Neha',    'Gupta',  'F', 'Pediatrician',      'MBBS, MD',       'RMC1004', '9800000004', 'neha.gupta@medicore.in',     600, '2018-01-10', 'Active',  4),
('Sanjay',  'Mehta',  'M', 'Dermatologist',     'MBBS, MD',       'RMC1005', '9800000005', 'sanjay.mehta@medicore.in',   700, '2016-11-05', 'Active',  5),
('Priya',   'Nair',   'F', 'ENT Specialist',    'MBBS, MS',       'RMC1006', '9800000006', 'priya.nair@medicore.in',     500, '2019-07-12', 'OnLeave', 6),
('Amit',    'Joshi',  'M', 'Physician',         'MBBS, MD',       'RMC1007', '9800000007', 'amit.joshi@medicore.in',     400, '2008-09-30', 'Active',  7),
('Kavita',  'Rao',    'F', 'Gynecologist',      'MBBS, MS',       'RMC1008', '9800000008', 'kavita.rao@medicore.in',     800, '2013-04-18', 'Active',  8),
('Manoj',   'Kapoor', 'M', 'Oncologist',        'MBBS, MD, DM',   'RMC1009', '9800000009', 'manoj.kapoor@medicore.in',  1500, '2005-02-25', 'Active',  9),
('Deepa',   'Iyer',   'F', 'Emergency Medicine','MBBS, MD',       'RMC1010', '9800000010', 'deepa.iyer@medicore.in',    1000, '2017-10-03', 'Active', 10);

-- Now set the head of each department (doctor 1 heads dept 1, and so on)
UPDATE department SET head_doctor_id = dept_id;

-- ---------- DOCTOR_SCHEDULE (JSON slot_config) ----------
INSERT INTO doctor_schedule (doctor_id, day_of_week, start_time, end_time, slot_duration_min, max_patients, slot_config) VALUES
(1, 'Monday',    '09:00', '13:00', 20, 12, '{"break": "11:00-11:15", "modes": ["in-person"]}'),
(1, 'Wednesday', '09:00', '13:00', 20, 12, '{"break": "11:00-11:15", "modes": ["in-person"]}'),
(2, 'Tuesday',   '10:00', '14:00', 30,  8, '{"break": "12:00-12:30", "modes": ["in-person", "video"]}'),
(2, 'Thursday',  '10:00', '14:00', 30,  8, '{"break": "12:00-12:30", "modes": ["in-person", "video"]}'),
(3, 'Monday',    '09:30', '14:30', 30, 10, '{"modes": ["in-person"]}'),
(3, 'Friday',    '09:30', '14:30', 30, 10, '{"modes": ["in-person"]}'),
(4, 'Monday',    '10:00', '16:00', 15, 24, '{"break": "13:00-14:00", "modes": ["in-person", "video"]}'),
(4, 'Saturday',  '10:00', '14:00', 15, 16, '{"modes": ["in-person"]}'),
(5, 'Wednesday', '11:00', '15:00', 20, 12, '{"modes": ["in-person"]}'),
(7, 'Monday',    '08:00', '16:00', 15, 32, '{"break": "12:30-13:30", "modes": ["in-person", "video"]}'),
(8, 'Tuesday',   '10:00', '15:00', 30, 10, '{"modes": ["in-person"]}'),
(9, 'Friday',    '11:00', '15:00', 30,  8, '{"modes": ["in-person"]}');

-- ---------- PATIENT  (GPS = latitude/longitude, JSON, BLOB) ----------
-- The photo column holds a few tiny bytes just to show a BLOB is stored.
INSERT INTO patient (first_name, middle_name, last_name, date_of_birth, gender, blood_group, email, street, city, state, pincode, registration_date, national_id, home_latitude, home_longitude, medical_profile, photo) VALUES
('Rohan',   'Kumar',  'Mishra',  '1985-04-12', 'M', 'O+',  'rohan.mishra@mail.com',  '12 MI Road',        'Jaipur',  'Rajasthan',     '302001', '2024-01-10', 'ID1001', 26.9150, 75.8000, '{"allergies": ["Penicillin"], "chronic": ["Hypertension"]}', UNHEX('89504E470D0A1A0A')),
('Sunita',   NULL,    'Devi',    '1972-09-30', 'F', 'A+',  'sunita.devi@mail.com',   '45 Tonk Road',      'Jaipur',  'Rajasthan',     '302018', '2024-02-14', 'ID1002', 26.8500, 75.8100, '{"allergies": [], "chronic": ["Diabetes", "Migraine"]}', NULL),
('Arjun',   NULL,     'Reddy',   '1995-12-05', 'M', 'B+',  'arjun.reddy@mail.com',   '7 Vaishali Nagar',  'Jaipur',  'Rajasthan',     '302021', '2024-03-02', 'ID1003', 26.9200, 75.7400, '{"allergies": ["Dust"], "chronic": []}', NULL),
('Meera',   'Lal',    'Patel',   '2016-07-21', 'F', 'AB+', NULL,                     '88 Malviya Nagar',  'Jaipur',  'Rajasthan',     '302017', '2024-03-18', NULL,     26.8600, 75.8100, '{"allergies": ["Peanuts"], "chronic": ["Asthma"]}', NULL),
('Imran',   NULL,     'Khan',    '1990-01-17', 'M', 'O-',  'imran.khan@mail.com',    '5 Civil Lines',     'Jaipur',  'Rajasthan',     '302006', '2024-04-05', 'ID1005', 26.9300, 75.8000, '{"allergies": [], "chronic": []}', NULL),
('Pooja',   NULL,     'Sharma',  '1968-11-02', 'F', 'A-',  'pooja.sharma@mail.com',  '23 Sodala',         'Jaipur',  'Rajasthan',     '302019', '2024-04-22', 'ID1006', 26.9000, 75.7600, '{"allergies": ["Sulfa drugs"], "chronic": ["Thyroid"]}', NULL),
('Harsh',   'Raj',    'Agarwal', '1958-06-09', 'M', 'B-',  'harsh.agarwal@mail.com', '9 Bani Park',       'Jaipur',  'Rajasthan',     '302016', '2024-05-11', 'ID1007', 26.9400, 75.7900, '{"allergies": [], "chronic": ["Heart disease", "Diabetes"]}', NULL),
('Kiran',   NULL,     'Bhatia',  '2001-03-27', 'F', 'O+',  'kiran.bhatia@mail.com',  '31 Mansarovar',     'Jaipur',  'Rajasthan',     '302020', '2024-06-01', 'ID1008', 26.8700, 75.7500, '{"allergies": [], "chronic": []}', NULL),
('Vivek',   NULL,     'Chauhan', '1979-08-14', 'M', 'A+',  'vivek.chauhan@mail.com', '17 Ajmer Road',     'Jaipur',  'Rajasthan',     '302006', '2024-06-19', 'ID1009', 26.9000, 75.7200, '{"allergies": ["Aspirin"], "chronic": ["Arthritis"]}', NULL),
('Anjali',  NULL,     'Saxena',  '1988-02-23', 'F', 'B+',  'anjali.saxena@mail.com', '60 Sector 14',      'Gurugram','Haryana',       '122001', '2024-07-07', 'ID1010', 28.4595, 77.0266, '{"allergies": [], "chronic": ["PCOS"]}', NULL),
('Deepak',  NULL,     'Yadav',   '1993-10-10', 'M', 'AB-', 'deepak.yadav@mail.com',  '14 Sanganer',       'Jaipur',  'Rajasthan',     '302029', '2024-08-15', 'ID1011', 26.8200, 75.7900, NULL, NULL),
('Nisha',   NULL,     'Jain',    '1999-05-30', 'F', 'O+',  'nisha.jain@mail.com',    '2 Jawahar Nagar',   'Delhi',   'Delhi',         '110001', '2024-09-03', 'ID1012', 28.6139, 77.2090, '{"allergies": ["Latex"], "chronic": []}', NULL);

-- ---------- PATIENT_PHONE (a patient can have several numbers) ----------
INSERT INTO patient_phone (patient_id, phone) VALUES
(1, '9811100001'), (1, '9811100101'),
(2, '9811100002'),
(3, '9811100003'), (3, '9811100103'),
(4, '9811100004'),
(5, '9811100005'),
(6, '9811100006'),
(7, '9811100007'),
(8, '9811100008'),
(9, '9811100009'),
(10, '9811100010'),
(11, '9811100011'),
(12, '9811100012');

-- ---------- EMERGENCY_CONTACT ----------
INSERT INTO emergency_contact (patient_id, contact_name, relation_to_patient, phone, alt_phone) VALUES
(1,  'Seema Mishra',   'Wife',     '9822200001', NULL),
(2,  'Ramesh Devi',    'Husband',  '9822200002', '9822200102'),
(3,  'Lakshmi Reddy',  'Mother',   '9822200003', NULL),
(4,  'Jay Patel',      'Father',   '9822200004', '9822200104'),
(5,  'Salma Khan',     'Sister',   '9822200005', NULL),
(6,  'Rakesh Sharma',  'Husband',  '9822200006', NULL),
(7,  'Rohit Agarwal',  'Son',      '9822200007', '9822200107'),
(8,  'Sunil Bhatia',   'Father',   '9822200008', NULL),
(9,  'Rita Chauhan',   'Wife',     '9822200009', NULL),
(10, 'Amit Saxena',    'Brother',  '9822200010', NULL),
(11, 'Geeta Yadav',    'Mother',   '9822200011', NULL),
(12, 'Anil Jain',      'Father',   '9822200012', '9822200112'),
(1,  'Mohan Mishra',   'Brother',  '9822200101', NULL);

-- ---------- APPOINTMENT ----------
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, appointment_type, status, reason, notes) VALUES
(1,  1,  '2026-10-01', '09:00', 'New',       'Completed', 'Chest pain on exertion',       'ECG advised'),
(2,  2,  '2026-10-01', '10:00', 'New',       'Completed', 'Frequent migraine',            NULL),
(3,  3,  '2026-10-02', '09:30', 'New',       'Completed', 'Knee pain while walking',      'X-ray advised'),
(4,  4,  '2026-10-02', '11:00', 'New',       'Completed', 'Cough and breathing trouble',  NULL),
(5,  5,  '2026-10-03', '10:00', 'New',       'Completed', 'Skin rash on arms',            NULL),
(6,  6,  '2026-10-03', '12:00', 'Follow-up', 'Completed', 'Ear pain review',              NULL),
(7,  7,  '2026-10-04', '09:00', 'New',       'Completed', 'Fever and weakness',           NULL),
(8,  8,  '2026-10-04', '10:30', 'New',       'Completed', 'Routine pregnancy checkup',    NULL),
(9,  9,  '2026-10-05', '11:00', 'New',       'Completed', 'Persistent weight loss',       'Biopsy advised'),
(10, 10, '2026-10-05', '14:00', 'Emergency', 'Completed', 'Severe abdominal pain',        NULL),
(1,  1,  '2026-10-15', '09:00', 'Follow-up', 'Scheduled', 'Review of ECG results',        NULL),
(2,  2,  '2026-10-16', '10:00', 'Follow-up', 'Cancelled', 'Migraine follow-up',           'Patient called to cancel'),
(11, 7,  '2026-10-17', '09:30', 'New',       'No-Show',   'General checkup',              NULL),
(12, 4,  '2026-11-10', '10:00', 'New',       'Scheduled', 'Child vaccination',            NULL),
(3,  3,  '2026-11-12', '09:30', 'Follow-up', 'Scheduled', 'Knee pain review',             NULL);

-- ---------- MEDICINE ----------
INSERT INTO medicine (medicine_name, generic_name, manufacturer, dosage_form, strength, unit_price, stock_quantity) VALUES
('Atorvastatin',  'Atorvastatin',   'Sun Pharma',   'Tablet',    '10mg',   12.00, 500),
('Aspirin',       'Acetylsalicylic','Bayer',        'Tablet',    '75mg',    3.50, 800),
('Sumatriptan',   'Sumatriptan',    'Cipla',        'Tablet',    '50mg',   25.00, 200),
('Ibuprofen',     'Ibuprofen',      'Cipla',        'Tablet',    '400mg',   4.00, 900),
('Salbutamol',    'Salbutamol',     'GSK',          'Syrup',     '100ml',  85.00, 150),
('Cetirizine',    'Cetirizine',     'Dr Reddys',    'Tablet',    '10mg',    2.50, 1000),
('Amoxicillin',   'Amoxicillin',    'Lupin',        'Capsule',   '500mg',   9.00, 600),
('Paracetamol',   'Paracetamol',    'Sun Pharma',   'Tablet',    '500mg',   2.00, 2000),
('Iron Folic',    'Ferrous Fumarate','Abbott',      'Tablet',    '100mg',   5.00, 700),
('Hydrocortisone','Hydrocortisone', 'GSK',          'Ointment',  '1%',     60.00, 120),
('Diclofenac',    'Diclofenac',     'Novartis',     'Injection', '75mg',   35.00, 100),
('Ofloxacin',     'Ofloxacin',      'Cipla',        'Drops',     '0.3%',   45.00, 90);

-- ---------- PRESCRIPTION (one per completed appointment) ----------
INSERT INTO prescription (appointment_id, prescription_date, diagnosis, advice, follow_up_date) VALUES
(1,  '2026-10-01', 'Angina',                'Avoid heavy exercise, low salt diet',  '2026-10-15'),
(2,  '2026-10-01', 'Chronic migraine',      'Avoid bright light, sleep well',       '2026-10-16'),
(3,  '2026-10-02', 'Knee osteoarthritis',   'Physiotherapy and weight control',     '2026-11-12'),
(4,  '2026-10-02', 'Bronchial asthma',      'Avoid dust and cold drinks',           NULL),
(5,  '2026-10-03', 'Contact dermatitis',    'Avoid harsh soaps',                    NULL),
(6,  '2026-10-03', 'Ear infection',         'Keep ear dry',                         NULL),
(7,  '2026-10-04', 'Viral fever',           'Rest and plenty of fluids',            NULL),
(8,  '2026-10-04', 'Normal pregnancy',      'Iron supplements, regular checkups',   '2026-11-04'),
(9,  '2026-10-05', 'Under investigation',   'Report after biopsy',                  '2026-10-12'),
(10, '2026-10-05', 'Acute gastritis',       'Avoid spicy food',                     NULL);

-- ---------- PRESCRIPTION_MEDICINE ----------
INSERT INTO prescription_medicine (prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions) VALUES
(1,  1,  '1 tablet',  'Once daily at night',   30, 30, 'Take after dinner'),
(1,  2,  '1 tablet',  'Once daily',            30, 30, 'Take after breakfast'),
(2,  3,  '1 tablet',  'When migraine starts',  10, 10, 'Maximum 2 tablets a day'),
(2,  8,  '1 tablet',  'Twice daily',            5, 10, NULL),
(3,  4,  '1 tablet',  'Twice daily',            7, 14, 'Take after meals'),
(3,  11, '1 injection','Once',                  1,  1, 'Given at the clinic'),
(4,  5,  '5 ml',      'Three times daily',      7, 1,  'Shake well'),
(4,  6,  '1 tablet',  'Once daily',             7,  7, NULL),
(5,  10, 'Apply thin layer', 'Twice daily',    10,  1, 'Do not apply on face'),
(5,  6,  '1 tablet',  'Once daily',             5,  5, NULL),
(6,  12, '3 drops',   'Three times daily',      5,  1, 'Right ear only'),
(7,  8,  '1 tablet',  'Three times daily',      5, 15, 'Take after food'),
(8,  9,  '1 tablet',  'Once daily',            60, 60, NULL),
(10, 8,  '1 tablet',  'Twice daily',            3,  6, NULL),
(10, 7,  '1 capsule', 'Twice daily',            5, 10, 'Complete the full course');

-- ---------- LAB_TEST (catalogue) ----------
INSERT INTO lab_test (test_name, category, sample_type, normal_range, price, turnaround_hours) VALUES
('Complete Blood Count', 'Blood',   'Blood',  '4.5-11 (WBC x1000)', 350,   4),
('Lipid Profile',        'Blood',   'Blood',  'LDL < 100 mg/dL',    600,   6),
('Blood Sugar Fasting',  'Blood',   'Blood',  '70-100 mg/dL',       150,   2),
('Thyroid Profile',      'Blood',   'Blood',  'TSH 0.4-4.0',        700,  12),
('Urine Routine',        'Urine',   'Urine',  NULL,                 200,   3),
('Chest X-Ray',          'Imaging', 'None',   NULL,                 500,   2),
('Knee X-Ray',           'Imaging', 'None',   NULL,                 600,   2),
('ECG',                  'Cardiac', 'None',   NULL,                 300,   1),
('MRI Brain',            'Imaging', 'None',   NULL,                5000,  24),
('Biopsy',               'Pathology','Tissue',NULL,                3500,  72);

-- ---------- LAB_ORDER ----------
INSERT INTO lab_order (appointment_id, order_date, priority, status) VALUES
(1,  '2026-10-01 09:30:00', 'Urgent',  'Completed'),
(2,  '2026-10-01 10:30:00', 'Routine', 'Completed'),
(3,  '2026-10-02 10:00:00', 'Routine', 'Completed'),
(4,  '2026-10-02 11:30:00', 'Routine', 'Completed'),
(7,  '2026-10-04 09:30:00', 'Routine', 'Completed'),
(9,  '2026-10-05 11:30:00', 'Urgent',  'Collected'),
(10, '2026-10-05 14:15:00', 'Urgent',  'Completed'),
(8,  '2026-10-04 11:00:00', 'Routine', 'Ordered');

-- ---------- LAB_ORDER_TEST (JSON and BLOB columns used here) ----------
INSERT INTO lab_order_test (lab_order_id, test_id, result_value, result_status, result_date, remarks, extra_results, report_image) VALUES
(1, 2, 'LDL 148 mg/dL', 'Abnormal', '2026-10-01 15:00:00', 'High cholesterol', '{"total_cholesterol": 235, "ldl": 148, "hdl": 38, "triglycerides": 210}', NULL),
(1, 8, 'ST changes seen', 'Abnormal', '2026-10-01 10:00:00', 'Show to cardiologist', NULL, UNHEX('FFD8FFE000104A464946')),
(2, 1, 'Normal',          'Normal',   '2026-10-01 15:00:00', NULL, '{"hemoglobin": 13.2, "wbc": 7400, "platelets": 250000}', NULL),
(2, 3, '95 mg/dL',        'Normal',   '2026-10-01 13:00:00', NULL, NULL, NULL),
(3, 7, 'Joint space narrowing', 'Abnormal', '2026-10-02 12:00:00', 'Early osteoarthritis', NULL, UNHEX('FFD8FFE000104A464946')),
(4, 6, 'Mild hyperinflation',   'Abnormal', '2026-10-02 13:30:00', NULL, NULL, UNHEX('FFD8FFE000104A464946')),
(5, 1, 'WBC high',        'Abnormal', '2026-10-04 14:00:00', 'Viral infection likely', '{"hemoglobin": 12.8, "wbc": 13200, "platelets": 180000}', NULL),
(5, 3, '110 mg/dL',       'Abnormal', '2026-10-04 12:00:00', 'Slightly high', NULL, NULL),
(6, 10, NULL,             NULL,       NULL,                  'Sample collected', NULL, NULL),
(7, 5, 'Normal',          'Normal',   '2026-10-05 17:15:00', NULL, NULL, NULL),
(7, 1, 'Normal',          'Normal',   '2026-10-05 18:00:00', NULL, '{"hemoglobin": 14.1, "wbc": 9000, "platelets": 300000}', NULL),
(8, 4, NULL,              NULL,       NULL,                  NULL, NULL, NULL);

-- ---------- ROOM ----------
INSERT INTO room (room_number, room_type, floor_no, bed_capacity, daily_charge, availability) VALUES
('G101', 'General', 1, 6,  800, 'Available'),
('G102', 'General', 1, 6,  800, 'Available'),
('P201', 'Private', 2, 1, 2500, 'Available'),
('P202', 'Private', 2, 1, 2500, 'Available'),
('P203', 'Private', 2, 1, 2800, 'Occupied'),
('ICU1', 'ICU',     3, 1, 8000, 'Available'),
('ICU2', 'ICU',     3, 1, 8000, 'Occupied'),
('G103', 'General', 1, 6,  800, 'Available'),
('P204', 'Private', 2, 1, 3000, 'Maintenance'),
('G104', 'General', 1, 4,  900, 'Available');

-- ---------- ADMISSION ----------
INSERT INTO admission (patient_id, room_id, doctor_id, admission_date, discharge_date, admission_type, diagnosis, status) VALUES
(4,  1, 4,  '2026-09-20 10:00:00', '2026-09-23 10:00:00', 'Planned',   'Asthma attack',        'Discharged'),
(6,  3, 6,  '2026-09-25 09:00:00', '2026-09-28 09:00:00', 'Planned',   'Ear surgery',          'Discharged'),
(7,  6, 7,  '2026-10-01 08:00:00', '2026-10-06 08:00:00', 'Emergency', 'Heart failure',        'Discharged'),
(9,  4, 9,  '2026-10-10 11:00:00', '2026-10-14 11:00:00', 'Planned',   'Chemotherapy cycle',   'Discharged'),
(10, 2, 10, '2026-10-05 15:00:00', '2026-10-08 15:00:00', 'Emergency', 'Acute appendicitis',   'Discharged'),
(2,  5, 2,  '2026-11-01 10:00:00', NULL,                  'Planned',   'Severe migraine',      'Admitted'),
(5,  7, 5,  '2026-11-03 20:00:00', NULL,                  'Emergency', 'Severe allergic reaction','Admitted'),
(8,  8, 8,  '2026-10-20 09:00:00', '2026-10-22 09:00:00', 'Planned',   'Delivery',             'Discharged');

-- ---------- BILL ----------
-- payment_status is typed by hand here; the test queries check it is right.
INSERT INTO bill (patient_id, appointment_id, admission_id, bill_date, bill_type, discount_amount, tax_amount, payment_status) VALUES
(1,  1,    NULL, '2026-10-01', 'OPD',   0,   0, 'Paid'),     -- bill 1
(2,  2,    NULL, '2026-10-01', 'OPD',  50,   0, 'Partial'),  -- bill 2
(3,  3,    NULL, '2026-10-02', 'OPD',   0,   0, 'Unpaid'),   -- bill 3
(4,  4,    1,    '2026-09-23', 'IPD',   0, 225, 'Paid'),     -- bill 4 (appointment + admission)
(5,  5,    NULL, '2026-10-03', 'OPD',   0,   0, 'Paid'),     -- bill 5
(6,  6,    2,    '2026-09-28', 'IPD', 300,   0, 'Paid'),     -- bill 6 (both)
(7,  NULL, 3,    '2026-10-06', 'IPD',   0,   0, 'Partial'),  -- bill 7
(7,  7,    NULL, '2026-10-04', 'OPD',   0,   0, 'Paid'),     -- bill 8
(8,  8,    NULL, '2026-10-04', 'OPD',   0,   0, 'Unpaid'),   -- bill 9
(9,  9,    4,    '2026-10-14', 'IPD', 500,   0, 'Partial'),  -- bill 10 (both)
(10, 10,   5,    '2026-10-08', 'IPD',   0,   0, 'Paid'),     -- bill 11 (both)
(8,  NULL, 8,    '2026-10-22', 'IPD',   0,   0, 'Paid');     -- bill 12

-- ---------- BILL_ITEM (unit_price is the price at the time of billing) ----------
INSERT INTO bill_item (bill_id, item_no, item_type, description, quantity, unit_price) VALUES
(1, 1, 'Consultation', 'Cardiology consultation',          1, 1000),
(1, 2, 'Medicine',     'Atorvastatin 10mg',               15,   12),
(2, 1, 'Consultation', 'Neurology consultation',           1, 1200),
(2, 2, 'LabTest',      'Complete Blood Count',             1,  350),
(3, 1, 'Consultation', 'Orthopedics consultation',         1,  900),
(4, 1, 'Room',         'General ward 3 days',              3,  800),
(4, 2, 'Consultation', 'Pediatrics consultation',          1,  600),
(4, 3, 'Procedure',    'Nebulization and physiotherapy',   1, 1500),
(5, 1, 'Consultation', 'Dermatology consultation',         1,  700),
(5, 2, 'Medicine',     'Hydrocortisone ointment',          1,  250),
(6, 1, 'Room',         'Private room 3 days',              3, 2500),
(6, 2, 'Consultation', 'ENT consultation',                 1,  500),
(6, 3, 'Procedure',    'Ear surgery',                      1,  800),
(7, 1, 'Room',         'ICU 5 days',                       5, 8000),
(7, 2, 'Procedure',    'Ventilator support',               1, 6000),
(8, 1, 'Consultation', 'General medicine consultation',    1,  400),
(9, 1, 'Consultation', 'Gynecology consultation',          1,  800),
(9, 2, 'LabTest',      'Complete Blood Count',             1,  350),
(9, 3, 'LabTest',      'Thyroid Profile',                  1,  250),
(10, 1, 'Room',        'Private room 4 days',              4, 3000),
(10, 2, 'Consultation','Oncology consultation',            1, 1500),
(11, 1, 'Room',        'General ward 3 days',              3,  900),
(11, 2, 'Consultation','Emergency consultation',           1, 1000),
(11, 3, 'Procedure',   'Appendectomy emergency care',      1, 2000),
(12, 1, 'Room',        'General ward 2 days',              2,  800);

-- ---------- PAYMENT ----------
INSERT INTO payment (bill_id, payment_date, amount, payment_mode, transaction_ref) VALUES
(1,  '2026-10-01 10:00:00',  1180, 'UPI',        'UPI20261001A'),
(2,  '2026-10-01 11:00:00',  1000, 'Cash',       NULL),
(4,  '2026-09-23 12:00:00',  2000, 'Cash',       NULL),
(4,  '2026-09-24 10:00:00',  2725, 'Insurance',  'CLM-4471'),
(5,  '2026-10-03 11:00:00',   950, 'Card',       'CARD8841'),
(6,  '2026-09-28 11:00:00',  8500, 'Insurance',  'CLM-4502'),
(7,  '2026-10-06 10:00:00', 30000, 'Insurance',  'CLM-4610'),
(7,  '2026-10-06 12:00:00', 10000, 'UPI',        'UPI20261006B'),
(8,  '2026-10-04 10:00:00',   400, 'Cash',       NULL),
(10, '2026-10-14 12:00:00',  5000, 'Card',       'CARD9921'),
(11, '2026-10-08 16:00:00',  5700, 'Cash',       NULL),
(12, '2026-10-22 10:00:00',  1600, 'UPI',        'UPI20261022C');

-- ---------- INSURANCE_PROVIDER ----------
INSERT INTO insurance_provider (provider_name, contact_phone, email, claim_helpline) VALUES
('Star Health',        '1800100001', 'care@starhealth.in',  '1800100101'),
('HDFC ERGO',          '1800100002', 'care@hdfcergo.in',    '1800100102'),
('ICICI Lombard',      '1800100003', 'care@icicilombard.in','1800100103'),
('Niva Bupa',          '1800100004', 'care@nivabupa.in',    '1800100104'),
('Bajaj Allianz',      '1800100005', 'care@bajaj.in',       NULL),
('New India Assurance','1800100006', NULL,                  '1800100106');

-- ---------- PATIENT_INSURANCE (a patient can hold policies with several providers) ----------
INSERT INTO patient_insurance (patient_id, provider_id, policy_number, plan_name, coverage_limit, valid_from, valid_to) VALUES
(1, 1, 'SH-1001',  'Family Floater',     500000, '2026-01-01', '2026-12-31'),
(2, 2, 'HE-2002',  'Optima Secure',      300000, '2026-02-01', '2027-01-31'),
(4, 3, 'IL-3003',  'Health Shield',      200000, '2026-01-01', '2026-12-31'),
(6, 1, 'SH-1006',  'Senior Citizen',     400000, '2026-03-01', '2027-02-28'),
(7, 4, 'NB-4007',  'ReAssure',           800000, '2026-01-01', '2026-12-31'),
(7, 6, 'NI-6007',  'Mediclaim',          300000, '2026-01-01', '2026-12-31'),
(9, 5, 'BA-5009',  'Health Guard',       600000, '2026-04-01', '2027-03-31'),
(10, 2, 'HE-2010', 'My Health',          350000, '2026-05-01', '2027-04-30');
