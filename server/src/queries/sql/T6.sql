-- T6: Invalid appointment status ('Maybe')
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
VALUES (3, 2, '2026-12-01', '09:00', 'Maybe', 'Bad status');
