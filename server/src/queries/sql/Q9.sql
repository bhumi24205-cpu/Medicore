-- Q9: Most prescribed medicines (GROUP BY and COUNT)
SELECT m.medicine_name, COUNT(*) AS times_prescribed
FROM prescription_medicine pm
JOIN medicine m ON pm.medicine_id = m.medicine_id
GROUP BY m.medicine_id, m.medicine_name
ORDER BY times_prescribed DESC;
