-- T16: Invalid JSON text in a JSON column
UPDATE patient SET medical_profile = '{allergies: broken' WHERE patient_id = 1;
