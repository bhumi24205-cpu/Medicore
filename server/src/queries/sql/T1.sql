-- T1: Double booking: doctor 1 already has an appointment on 2026-10-01 at 09:00
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason)
VALUES (3, 1, '2026-10-01', '09:00', 'Test double booking');
