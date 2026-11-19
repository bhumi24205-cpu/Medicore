-- B1: Which patients have a photo, and how big is it (in bytes)
SELECT patient_id, first_name, LENGTH(photo) AS photo_bytes
FROM patient
WHERE photo IS NOT NULL;
