-- T5: Negative consultation fee (-100)
INSERT INTO doctor (first_name, last_name, gender, specialization, qualification, license_no, phone, email, consultation_fee, joining_date, dept_id)
VALUES ('Test', 'Doctor', 'M', 'General', 'MBBS', 'RMC9998', '9800009998', 'test@medicore.in', -100, '2025-01-01', 1);
