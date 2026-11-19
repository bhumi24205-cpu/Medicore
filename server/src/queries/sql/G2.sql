-- G2: Patients living within 5 km of the hospital
SELECT patient_id, first_name, city,
       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km
FROM patient
WHERE ST_Distance_Sphere(POINT(home_longitude, home_latitude),
                         POINT(75.7873, 26.9124)) <= 5000;
