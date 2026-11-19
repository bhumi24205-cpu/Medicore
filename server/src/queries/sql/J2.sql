-- J2: Patients with Diabetes as a chronic condition
SELECT patient_id, first_name, medical_profile->>'$.chronic' AS chronic_conditions
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Diabetes"', '$.chronic');
