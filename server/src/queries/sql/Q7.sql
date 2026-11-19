-- Q7: Weak entity: emergency contacts of patient 1
SELECT p.first_name, ec.contact_name, ec.relation_to_patient, ec.phone
FROM patient p
JOIN emergency_contact ec ON p.patient_id = ec.patient_id
WHERE p.patient_id = 1;
