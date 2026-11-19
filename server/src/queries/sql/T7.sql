-- T7: Discharge date before admission date
INSERT INTO admission (patient_id, room_id, doctor_id, admission_date, discharge_date, admission_type, diagnosis, status)
VALUES (3, 1, 3, '2026-11-01 10:00:00', '2026-10-01 10:00:00', 'Planned', 'Test', 'Discharged');
