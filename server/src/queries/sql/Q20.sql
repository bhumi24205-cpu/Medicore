-- Q20: Patients with NO insurance (LEFT JOIN, find NULLs)
SELECT p.patient_id, p.first_name, p.last_name
FROM patient p
LEFT JOIN patient_insurance pi ON p.patient_id = pi.patient_id
WHERE pi.patient_id IS NULL;
