-- Q22: HAVING: doctors with 2 or more appointments
SELECT d.first_name, d.last_name, COUNT(*) AS total
FROM appointment a
JOIN doctor d ON a.doctor_id = d.doctor_id
GROUP BY d.doctor_id, d.first_name, d.last_name
HAVING COUNT(*) >= 2;
