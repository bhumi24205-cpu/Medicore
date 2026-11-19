-- Q11: Patients currently admitted, with room and doctor
SELECT p.first_name, p.last_name, r.room_number, r.room_type, d.first_name AS doctor
FROM admission ad
JOIN patient p ON ad.patient_id = p.patient_id
JOIN room r    ON ad.room_id = r.room_id
JOIN doctor d  ON ad.doctor_id = d.doctor_id
WHERE ad.status = 'Admitted';
