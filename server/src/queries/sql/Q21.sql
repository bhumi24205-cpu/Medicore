-- Q21: Subquery: patients who spent more than the average bill
SELECT p.first_name, p.last_name, s.total_amount
FROM v_bill_summary s
JOIN patient p ON s.patient_id = p.patient_id
WHERE s.total_amount > (SELECT AVG(total_amount) FROM v_bill_summary);
