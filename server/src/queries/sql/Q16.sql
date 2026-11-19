-- Q16: Unpaid or partly paid bills with the balance still due
SELECT bill_id, patient_id, total_amount, amount_paid, balance_due
FROM v_bill_summary
WHERE balance_due > 0;
