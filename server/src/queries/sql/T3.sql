-- T3: Appointment for a patient that does not exist (patient_id = 999)
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (999, 1, '2026-12-01', '09:00', 'Unknown patient');
