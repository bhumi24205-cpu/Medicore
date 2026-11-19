-- =====================================================================
-- MediCore test queries  (run AFTER the schema and sample data)
-- Every query has a one-line comment saying what it answers.
-- =====================================================================
USE medicore_transactional;

-- Q1. Simple SELECT with WHERE: all active doctors
SELECT doctor_id, first_name, last_name, specialization
FROM doctor
WHERE status = 'Active';

-- Q2. JOIN: each doctor with the department name
SELECT d.first_name, d.last_name, dep.dept_name
FROM doctor d
JOIN department dep ON d.dept_id = dep.dept_id;

-- Q3. JOIN: which doctor heads which department
SELECT dep.dept_name, d.first_name AS head_first_name, d.last_name AS head_last_name
FROM department dep
JOIN doctor d ON dep.head_doctor_id = d.doctor_id;

-- Q4. GROUP BY: number of appointments per doctor
SELECT d.first_name, d.last_name, COUNT(a.appointment_id) AS total_appointments
FROM doctor d
LEFT JOIN appointment a ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
ORDER BY total_appointments DESC;

-- Q5. Today's / upcoming scheduled appointments with patient and doctor names
SELECT a.appointment_date, a.appointment_time,
       p.first_name AS patient, d.first_name AS doctor, a.reason
FROM appointment a
JOIN patient p ON a.patient_id = p.patient_id
JOIN doctor d  ON a.doctor_id = d.doctor_id
WHERE a.status = 'Scheduled'
ORDER BY a.appointment_date, a.appointment_time;

-- Q6. Multivalued attribute: all phone numbers of each patient
SELECT p.first_name, p.last_name, ph.phone
FROM patient p
JOIN patient_phone ph ON p.patient_id = ph.patient_id
ORDER BY p.patient_id;

-- Q7. Weak entity: emergency contacts of patient 1
SELECT p.first_name, ec.contact_name, ec.relation_to_patient, ec.phone
FROM patient p
JOIN emergency_contact ec ON p.patient_id = ec.patient_id
WHERE p.patient_id = 1;

-- Q8. Many-to-many: medicines in each prescription with dosage
SELECT pr.prescription_id, p.first_name AS patient, m.medicine_name, pm.dosage, pm.frequency, pm.duration_days
FROM prescription pr
JOIN appointment a ON pr.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN prescription_medicine pm ON pr.prescription_id = pm.prescription_id
JOIN medicine m ON pm.medicine_id = m.medicine_id
ORDER BY pr.prescription_id;

-- Q9. Most prescribed medicines (GROUP BY and COUNT)
SELECT m.medicine_name, COUNT(*) AS times_prescribed
FROM prescription_medicine pm
JOIN medicine m ON pm.medicine_id = m.medicine_id
GROUP BY m.medicine_id, m.medicine_name
ORDER BY times_prescribed DESC;

-- Q10. Lab results of every patient
SELECT p.first_name, lt.test_name, lot.result_value, lot.result_status
FROM lab_order_test lot
JOIN lab_order lo ON lot.lab_order_id = lo.lab_order_id
JOIN appointment a ON lo.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN lab_test lt ON lot.test_id = lt.test_id
ORDER BY p.patient_id;

-- Q11. Patients currently admitted, with room and doctor
SELECT p.first_name, p.last_name, r.room_number, r.room_type, d.first_name AS doctor
FROM admission ad
JOIN patient p ON ad.patient_id = p.patient_id
JOIN room r    ON ad.room_id = r.room_id
JOIN doctor d  ON ad.doctor_id = d.doctor_id
WHERE ad.status = 'Admitted';

-- Q12. Derived attribute: patient age (view)
SELECT patient_id, first_name, date_of_birth, age FROM v_patient;

-- Q13. Derived attribute: doctor experience (view)
SELECT doctor_id, first_name, specialization, experience_years FROM v_doctor;

-- Q14. Derived attribute: length of stay (view)
SELECT admission_id, patient_id, admission_date, discharge_date, length_of_stay FROM v_admission;

-- Q15. Derived attributes: bill total, paid and balance (view)
SELECT * FROM v_bill_summary;

-- Q16. Unpaid or partly paid bills with the balance still due
SELECT bill_id, patient_id, total_amount, amount_paid, balance_due
FROM v_bill_summary
WHERE balance_due > 0;

-- Q17. Total money received per payment mode
SELECT payment_mode, COUNT(*) AS payments, SUM(amount) AS total_received
FROM payment
GROUP BY payment_mode;

-- Q18. Total revenue per department (appointment bills only, items only)
SELECT dep.dept_name, SUM(bi.quantity * bi.unit_price) AS revenue
FROM bill b
JOIN appointment a ON b.appointment_id = a.appointment_id
JOIN doctor d ON a.doctor_id = d.doctor_id
JOIN department dep ON d.dept_id = dep.dept_id
JOIN bill_item bi ON b.bill_id = bi.bill_id
GROUP BY dep.dept_id, dep.dept_name
ORDER BY revenue DESC;

-- Q19. Patients with insurance and the provider name
SELECT p.first_name, p.last_name, ip.provider_name, pi.policy_number, pi.coverage_limit
FROM patient_insurance pi
JOIN patient p ON pi.patient_id = p.patient_id
JOIN insurance_provider ip ON pi.provider_id = ip.provider_id;

-- Q20. Patients with NO insurance (LEFT JOIN, find NULLs)
SELECT p.patient_id, p.first_name, p.last_name
FROM patient p
LEFT JOIN patient_insurance pi ON p.patient_id = pi.patient_id
WHERE pi.patient_id IS NULL;

-- Q21. Subquery: patients who spent more than the average bill
SELECT p.first_name, p.last_name, s.total_amount
FROM v_bill_summary s
JOIN patient p ON s.patient_id = p.patient_id
WHERE s.total_amount > (SELECT AVG(total_amount) FROM v_bill_summary);

-- Q22. HAVING: doctors with 2 or more appointments
SELECT d.first_name, d.last_name, COUNT(*) AS total
FROM appointment a
JOIN doctor d ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
HAVING COUNT(*) >= 2;

-- =====================================================================
-- JSON queries (professor's requirement)
-- ->> gets a value out of a JSON column as plain text
-- =====================================================================

-- J1. Patients who are allergic to Penicillin
SELECT patient_id, first_name, medical_profile
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Penicillin"', '$.allergies');

-- J2. Patients with Diabetes as a chronic condition
SELECT patient_id, first_name, medical_profile->>'$.chronic' AS chronic_conditions
FROM patient
WHERE JSON_CONTAINS(medical_profile, '"Diabetes"', '$.chronic');

-- J3. Hemoglobin value stored inside the lab result JSON
SELECT lab_order_id, test_id, extra_results->>'$.hemoglobin' AS hemoglobin
FROM lab_order_test
WHERE extra_results IS NOT NULL AND extra_results->>'$.hemoglobin' IS NOT NULL;

-- J4. Doctors who offer video consultation
SELECT doctor_id, day_of_week, slot_config->>'$.modes' AS modes
FROM doctor_schedule
WHERE JSON_CONTAINS(slot_config->'$.modes', '"video"');

-- =====================================================================
-- GPS queries (professor's requirement)
-- Hospital is at latitude 26.9124, longitude 75.7873 (Jaipur).
-- ST_Distance_Sphere gives the distance in metres between two points.
-- NOTE: POINT(longitude, latitude)  <- longitude comes first here.
-- =====================================================================

-- G1. Distance of every patient's home from the hospital, in km
SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
ORDER BY distance_km;

-- G2. Patients living within 5 km of the hospital
SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
WHERE ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                         POINT(75.7873, 26.9124)) <= 5000;

-- =====================================================================
-- BLOB queries (professor's requirement)
-- =====================================================================

-- B1. Which patients have a photo, and how big is it (in bytes)
SELECT patient_id, first_name, LENGTH(photo) AS photo_bytes
FROM patient
WHERE photo IS NOT NULL;

-- B2. Which lab results have a report image
SELECT lab_order_id, test_id, LENGTH(report_image) AS image_bytes
FROM lab_order_test
WHERE report_image IS NOT NULL;
