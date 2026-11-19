-- =====================================================================
-- MediCore RULE TESTS
-- Every statement below is SUPPOSED TO FAIL with an error.
-- If one of them succeeds, that rule is not working.
-- In MySQL Workbench, run them ONE BY ONE (select a statement, press Ctrl+Enter).
-- =====================================================================
USE medicore_transactional;

-- T1. Double booking: doctor 1 already has an appointment on 2026-10-01 at 09:00   -> UNIQUE
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (3, 1, '2026-10-01', '09:00', 'Test double booking');

-- T2. A second prescription for the same appointment                             -> UNIQUE
INSERT INTO prescription (appointment_id, prescription_date, diagnosis)
VALUES (1, '2026-10-01', 'Duplicate prescription');

-- T3. Appointment for a patient that does not exist                              -> FOREIGN KEY
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (999, 1, '2026-12-01', '09:00', 'Unknown patient');

-- T4. Duplicate doctor email                                                     -> UNIQUE
INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, dept_id)
VALUES ('Test', 'Doctor', 'M', 'General', 'MBBS', 'RMC9999', '9800009999', 'rajesh.sharma@medicore.in', 500, '2025-01-01', 1);

-- T5. Negative consultation fee                                                  -> CHECK
INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, dept_id)
VALUES ('Test', 'Doctor', 'M', 'General', 'MBBS', 'RMC9998', '9800009998', 'test@medicore.in', -100, '2025-01-01', 1);

-- T6. Invalid appointment status                                                 -> CHECK
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
VALUES (3, 2, '2026-12-01', '09:00', 'Maybe', 'Bad status');

-- T7. Discharge date before admission date                                       -> CHECK
INSERT INTO admission (patient_id, room_id, doctor_id, admission_date, discharge_date, admission_type, diagnosis, status)
VALUES (3, 1, 3, '2026-11-01 10:00:00', '2026-10-01 10:00:00', 'Planned', 'Test', 'Discharged');

-- T8. A bill with neither appointment nor admission                              -> CHECK
INSERT INTO bill (patient_id, appointment_id, admission_id, bill_date, bill_type)
VALUES (1, NULL, NULL, '2026-11-05', 'OPD');

-- T9. Two bills for the same appointment (appointment 1 is already billed)       -> UNIQUE
INSERT INTO bill (patient_id, appointment_id, bill_date, bill_type)
VALUES (1, 1, '2026-11-05', 'OPD');

-- T10. Payment of zero rupees                                                    -> CHECK
INSERT INTO payment (bill_id, payment_date, amount, payment_mode)
VALUES (3, '2026-11-05 10:00:00', 0, 'Cash');

-- T11. Invalid payment mode                                                      -> CHECK
INSERT INTO payment (bill_id, payment_date, amount, payment_mode)
VALUES (3, '2026-11-05 10:00:00', 500, 'Bitcoin');

-- T12. Invalid latitude (must be between -90 and 90)                             -> CHECK
INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date, home_latitude, home_longitude)
VALUES ('Test', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05', 120.5, 75.8);

-- T13. Deleting a doctor who has appointments                                    -> FOREIGN KEY (RESTRICT)
DELETE FROM doctor WHERE doctor_id = 1;

-- T14. Deleting a patient who has appointments                                   -> FOREIGN KEY (RESTRICT)
DELETE FROM patient WHERE patient_id = 1;

-- T15. Two departments with the same head doctor                                 -> UNIQUE
UPDATE department SET head_doctor_id = 1 WHERE dept_id = 2;

-- T16. Invalid JSON text in a JSON column                                        -> JSON validation
UPDATE patient SET medical_profile = '{allergies: broken' WHERE patient_id = 1;

-- =====================================================================
-- These two should SUCCEED (they show CASCADE working).
-- They are wrapped in a transaction and rolled back, so your data is safe.
-- =====================================================================
START TRANSACTION;
  SELECT COUNT(*) AS items_before FROM bill_item WHERE bill_id = 3;
  DELETE FROM bill WHERE bill_id = 3;           -- bill 3 has no payments, so it can be deleted
  SELECT COUNT(*) AS items_after_delete FROM bill_item WHERE bill_id = 3;   -- becomes 0 (CASCADE)
ROLLBACK;

START TRANSACTION;
  INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date)
  VALUES ('Temp', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05');
  SET @new_id = LAST_INSERT_ID();
  INSERT INTO patient_phone (patient_id, phone) VALUES (@new_id, '9000000000');
  SELECT COUNT(*) AS phones_before FROM patient_phone WHERE patient_id = @new_id;        -- 1
  DELETE FROM patient WHERE patient_id = @new_id;      -- this patient has no appointments, so it can be deleted
  SELECT COUNT(*) AS phones_after_delete FROM patient_phone WHERE patient_id = @new_id;  -- 0 (CASCADE)
ROLLBACK;
