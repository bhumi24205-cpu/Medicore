-- CASCADE_2: Deleting a patient cascades and automatically deletes their patient_phones
START TRANSACTION;
  INSERT INTO patient (first_name, last_name, date_of_birth, gender, street, city, state, pincode, registration_date)
  VALUES ('Temp', 'Patient', '2000-01-01', 'M', 'Street', 'Jaipur', 'Rajasthan', '302001', '2026-11-05');
  SET @new_id = LAST_INSERT_ID();
  INSERT INTO patient_phone (patient_id, phone) VALUES (@new_id, '9000000000');
  SELECT COUNT(*) AS phones_before FROM patient_phone WHERE patient_id = @new_id;
  DELETE FROM patient WHERE patient_id = @new_id;
  SELECT COUNT(*) AS phones_after_delete FROM patient_phone WHERE patient_id = @new_id;
ROLLBACK;
