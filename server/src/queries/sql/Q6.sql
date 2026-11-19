-- Q6: Multivalued attribute: all phone numbers of each patient
SELECT p.first_name, p.last_name, ph.phone
FROM patient p
JOIN patient_phone ph ON p.patient_id = ph.patient_id
ORDER BY p.patient_id;
