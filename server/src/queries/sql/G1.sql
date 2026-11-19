-- G1: Distance of every patient's home from the hospital, in km (Jaipur 26.9124, 75.7873)
SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
ORDER BY distance_km;
