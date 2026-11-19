-- Q10: Lab results of every patient
SELECT p.first_name, lt.test_name, lot.result_value, lot.result_status
FROM lab_order_test lot
JOIN lab_order lo ON lot.lab_order_id = lo.lab_order_id
JOIN appointment a ON lo.appointment_id = a.appointment_id
JOIN patient p ON a.patient_id = p.patient_id
JOIN lab_test lt ON lot.test_id = lt.test_id
ORDER BY p.patient_id;
