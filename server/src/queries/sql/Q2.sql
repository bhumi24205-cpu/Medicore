-- Q2: JOIN: each doctor with the department name
SELECT d.first_name, d.last_name, dep.dept_name
FROM doctor d
JOIN department dep ON d.dept_id = dep.dept_id;
