-- Q1: Simple SELECT with WHERE: all active doctors
SELECT doctor_id, first_name, last_name, specialization
FROM doctor
WHERE status = 'Active';
