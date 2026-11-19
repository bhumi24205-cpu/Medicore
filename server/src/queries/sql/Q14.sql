-- Q14: Derived attribute: length of stay (view v_admission)
SELECT admission_id, patient_id, admission_date, discharge_date, length_of_stay FROM v_admission;
