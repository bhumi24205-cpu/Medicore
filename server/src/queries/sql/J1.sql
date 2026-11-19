-- J1: Patients who are allergic to Penicillin
SELECT patient_id, first_name, medical_profile
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Penicillin"', '$.allergies');
