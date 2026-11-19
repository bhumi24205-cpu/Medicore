-- T8: A bill with neither appointment nor admission (both NULL)
INSERT INTO bill (patient_id, appointment_id, admission_id, bill_date, bill_type)
VALUES (1, NULL, NULL, '2026-11-05', 'OPD');
