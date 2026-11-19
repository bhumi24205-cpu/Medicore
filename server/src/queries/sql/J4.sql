-- J4: Doctors who offer video consultation
SELECT doctor_id, day_of_week, slot_config->>'$.modes' AS modes
FROM doctor_schedule
WHERE JSON_CONTAINS(slot_config->'$.modes', '"video"');
