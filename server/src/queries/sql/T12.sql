-- T12: Invalid latitude (120.5 - must be between -90 and 90)
INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date, home_latitude, home_longitude)
VALUES ('Test', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05', 120.5, 75.8);
