-- T11: Invalid payment mode ('Bitcoin')
INSERT INTO payment (bill_id, payment_date, amount, payment_mode)
VALUES (3, '2026-11-05 10:00:00', 500, 'Bitcoin');
