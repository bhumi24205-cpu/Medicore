-- Q5: Today's / upcoming scheduled appointments with patient and doctor names
SELECT a.appointment_date, a.appointment_time,
       p.first_name AS patient, d.first_name AS doctor, a.reason
FROM appointment a
JOIN patient p ON a.patient_id = p.patient_id
JOIN doctor d  ON a.doctor_id = d.doctor_id
WHERE a.status = 'Scheduled'
ORDER BY a.appointment_date, a.appointment_time;
