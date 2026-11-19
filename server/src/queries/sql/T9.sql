-- T9: Two bills for the same appointment (appointment 1 already billed)
INSERT INTO bill (patient_id, appointment_id, bill_date, bill_type)
VALUES (1, 1, '2026-11-05', 'OPD');
