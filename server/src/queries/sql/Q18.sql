-- Q18: Total revenue per department (appointment bills only, items only)
SELECT dep.dept_name, SUM(bi.quantity * bi.unit_price) AS revenue
FROM bill b
JOIN appointment a ON b.appointment_id = a.appointment_id
JOIN doctor d ON a.doctor_id = d.doctor_id
JOIN department dep ON d.dept_id = dep.dept_id
JOIN bill_item bi ON b.bill_id = bi.bill_id
GROUP BY dep.dept_id, dep.dept_name
ORDER BY revenue DESC;
