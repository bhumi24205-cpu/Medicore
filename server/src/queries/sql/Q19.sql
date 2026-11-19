-- Q19: Patients with insurance and the provider name
SELECT p.first_name, p.last_name, ip.provider_name, pi.policy_number, pi.coverage_limit
FROM patient_insurance pi
JOIN patient p ON pi.patient_id = p.patient_id
JOIN insurance_provider ip ON pi.provider_id = ip.provider_id;
