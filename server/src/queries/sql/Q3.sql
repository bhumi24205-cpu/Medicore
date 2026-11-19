-- Q3: JOIN: which doctor heads which department
SELECT dep.dept_name, d.first_name AS head_first_name, d.last_name AS head_last_name
FROM department dep
JOIN doctor d ON dep.head_doctor_id = d.doctor_id;
