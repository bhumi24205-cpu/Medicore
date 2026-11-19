-- Q8: Many-to-many: medicines in each prescription with dosage
SELECT pr.prescription_id, p.first_name AS patient, m.medicine_name, pm.dosage, pm.frequency, pm.duration_days
FROM prescription pr
JOIN appointment a ON pr.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN prescription_medicine pm ON pr.prescription_id = pm.prescription_id
JOIN medicine m ON pm.medicine_id = m.medicine_id
ORDER BY pr.prescription_id;
