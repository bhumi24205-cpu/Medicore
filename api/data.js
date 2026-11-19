module.exports = {
  "TEST_QUERIES": [
    {
      "code": "Q1",
      "category": "Standard SQL",
      "description": "Simple SELECT with WHERE: all active doctors",
      "sql": "SELECT doctor_id, first_name, last_name, specialization\nFROM doctor\nWHERE status = 'Active';"
    },
    {
      "code": "Q2",
      "category": "Standard SQL",
      "description": "JOIN: each doctor with the department name",
      "sql": "SELECT d.first_name, d.last_name, dep.dept_name\nFROM doctor d\nJOIN department dep ON d.dept_id = dep.dept_id;"
    },
    {
      "code": "Q3",
      "category": "Standard SQL",
      "description": "JOIN: which doctor heads which department",
      "sql": "SELECT dep.dept_name, d.first_name AS head_first_name, d.last_name AS head_last_name\nFROM department dep\nJOIN doctor d ON dep.head_doctor_id = d.doctor_id;"
    },
    {
      "code": "Q4",
      "category": "Standard SQL",
      "description": "GROUP BY: number of appointments per doctor",
      "sql": "SELECT d.first_name, d.last_name, COUNT(a.appointment_id) AS total_appointments\nFROM doctor d\nLEFT JOIN appointment a ON a.doctor_id = d.doctor_id\nGROUP BY d.doctor_id, d.first_name, d.last_name\nORDER BY total_appointments DESC;"
    },
    {
      "code": "Q5",
      "category": "Standard SQL",
      "description": "Today's / upcoming scheduled appointments with patient and doctor names",
      "sql": "SELECT a.appointment_date, a.appointment_time,\n       p.first_name AS patient, d.first_name AS doctor, a.reason\nFROM appointment a\nJOIN patient p ON a.patient_id = p.patient_id\nJOIN doctor d  ON a.doctor_id = d.doctor_id\nWHERE a.status = 'Scheduled'\nORDER BY a.appointment_date, a.appointment_time;"
    },
    {
      "code": "Q6",
      "category": "Standard SQL",
      "description": "Multivalued attribute: all phone numbers of each patient",
      "sql": "SELECT p.first_name, p.last_name, ph.phone\nFROM patient p\nJOIN patient_phone ph ON p.patient_id = ph.patient_id\nORDER BY p.patient_id;"
    },
    {
      "code": "Q7",
      "category": "Standard SQL",
      "description": "Weak entity: emergency contacts of patient 1",
      "sql": "SELECT p.first_name, ec.contact_name, ec.relation_to_patient, ec.phone\nFROM patient p\nJOIN emergency_contact ec ON p.patient_id = ec.patient_id\nWHERE p.patient_id = 1;"
    },
    {
      "code": "Q8",
      "category": "Standard SQL",
      "description": "Many-to-many: medicines in each prescription with dosage",
      "sql": "SELECT pr.prescription_id, p.first_name AS patient, m.medicine_name, pm.dosage, pm.frequency, pm.duration_days\nFROM prescription pr\nJOIN appointment a ON pr.appointment_id = a.appointment_id\nJOIN patient p ON a.patient_id = p.patient_id\nJOIN prescription_medicine pm ON pr.prescription_id = pm.prescription_id\nJOIN medicine m ON pm.medicine_id = m.medicine_id\nORDER BY pr.prescription_id;"
    },
    {
      "code": "Q9",
      "category": "Standard SQL",
      "description": "Most prescribed medicines (GROUP BY and COUNT)",
      "sql": "SELECT m.medicine_name, COUNT(*) AS times_prescribed\nFROM prescription_medicine pm\nJOIN medicine m ON pm.medicine_id = m.medicine_id\nGROUP BY m.medicine_id, m.medicine_name\nORDER BY times_prescribed DESC;"
    },
    {
      "code": "Q10",
      "category": "Standard SQL",
      "description": "Lab results of every patient",
      "sql": "SELECT p.first_name, lt.test_name, lot.result_value, lot.result_status\nFROM lab_order_test lot\nJOIN lab_order lo ON lot.lab_order_id = lo.lab_order_id\nJOIN appointment a ON lo.appointment_id = a.appointment_id\nJOIN patient p ON a.patient_id = p.patient_id\nJOIN lab_test lt ON lot.test_id = lt.test_id\nORDER BY p.patient_id;"
    },
    {
      "code": "Q11",
      "category": "Standard SQL",
      "description": "Patients currently admitted, with room and doctor",
      "sql": "SELECT p.first_name, p.last_name, r.room_number, r.room_type, d.first_name AS doctor\nFROM admission ad\nJOIN patient p ON ad.patient_id = p.patient_id\nJOIN room r    ON ad.room_id = r.room_id\nJOIN doctor d  ON ad.doctor_id = d.doctor_id\nWHERE ad.status = 'Admitted';"
    },
    {
      "code": "Q12",
      "category": "Views (Derived Attributes)",
      "description": "Derived attribute: patient age (view v_patient)",
      "sql": "SELECT patient_id, first_name, date_of_birth, age FROM v_patient;"
    },
    {
      "code": "Q13",
      "category": "Views (Derived Attributes)",
      "description": "Derived attribute: doctor experience (view v_doctor)",
      "sql": "SELECT doctor_id, first_name, specialization, experience_years FROM v_doctor;"
    },
    {
      "code": "Q14",
      "category": "Views (Derived Attributes)",
      "description": "Derived attribute: length of stay (view v_admission)",
      "sql": "SELECT admission_id, patient_id, admission_date, discharge_date, length_of_stay FROM v_admission;"
    },
    {
      "code": "Q15",
      "category": "Views (Derived Attributes)",
      "description": "Derived attributes: bill total, paid and balance (view v_bill_summary)",
      "sql": "SELECT * FROM v_bill_summary;"
    },
    {
      "code": "Q16",
      "category": "Standard SQL",
      "description": "Unpaid or partly paid bills with the balance still due",
      "sql": "SELECT bill_id, patient_id, total_amount, amount_paid, balance_due\nFROM v_bill_summary\nWHERE balance_due > 0;"
    },
    {
      "code": "Q17",
      "category": "Standard SQL",
      "description": "Total money received per payment mode",
      "sql": "SELECT payment_mode, COUNT(*) AS payments, SUM(amount) AS total_received\nFROM payment\nGROUP BY payment_mode;"
    },
    {
      "code": "Q18",
      "category": "Standard SQL",
      "description": "Total revenue per department (appointment bills only, items only)",
      "sql": "SELECT dep.dept_name, SUM(bi.quantity * bi.unit_price) AS revenue\nFROM bill b\nJOIN appointment a ON b.appointment_id = a.appointment_id\nJOIN doctor d ON a.doctor_id = d.doctor_id\nJOIN department dep ON d.dept_id = dep.dept_id\nJOIN bill_item bi ON b.bill_id = bi.bill_id\nGROUP BY dep.dept_id, dep.dept_name\nORDER BY revenue DESC;"
    },
    {
      "code": "Q19",
      "category": "Standard SQL",
      "description": "Patients with insurance and the provider name",
      "sql": "SELECT p.first_name, p.last_name, ip.provider_name, pi.policy_number, pi.coverage_limit\nFROM patient_insurance pi\nJOIN patient p ON pi.patient_id = p.patient_id\nJOIN insurance_provider ip ON pi.provider_id = ip.provider_id;"
    },
    {
      "code": "Q20",
      "category": "Standard SQL",
      "description": "Patients with NO insurance (LEFT JOIN, find NULLs)",
      "sql": "SELECT p.patient_id, p.first_name, p.last_name\nFROM patient p\nLEFT JOIN patient_insurance pi ON p.patient_id = pi.patient_id\nWHERE pi.patient_id IS NULL;"
    },
    {
      "code": "Q21",
      "category": "Subqueries & Aggregates",
      "description": "Subquery: patients who spent more than the average bill",
      "sql": "SELECT p.first_name, p.last_name, s.total_amount\nFROM v_bill_summary s\nJOIN patient p ON s.patient_id = p.patient_id\nWHERE s.total_amount > (SELECT AVG(total_amount) FROM v_bill_summary);"
    },
    {
      "code": "Q22",
      "category": "Subqueries & Aggregates",
      "description": "HAVING: doctors with 2 or more appointments",
      "sql": "SELECT d.first_name, d.last_name, COUNT(*) AS total\nFROM appointment a\nJOIN doctor d ON a.doctor_id = d.doctor_id\nGROUP BY d.doctor_id, d.first_name, d.last_name\nHAVING COUNT(*) >= 2;"
    },
    {
      "code": "J1",
      "category": "JSON Queries",
      "description": "Patients who are allergic to Penicillin",
      "sql": "SELECT patient_id, first_name, medical_profile\nFROM patient\nWHERE JSON_CONTAINS(medical_profile, '\"Penicillin\"', '$.allergies');"
    },
    {
      "code": "J2",
      "category": "JSON Queries",
      "description": "Patients with Diabetes as a chronic condition",
      "sql": "SELECT patient_id, first_name, medical_profile->>'$.chronic' AS chronic_conditions\nFROM patient\nWHERE JSON_CONTAINS(medical_profile, '\"Diabetes\"', '$.chronic');"
    },
    {
      "code": "J3",
      "category": "JSON Queries",
      "description": "Hemoglobin value stored inside the lab result JSON",
      "sql": "SELECT lab_order_id, test_id, extra_results->>'$.hemoglobin' AS hemoglobin\nFROM lab_order_test\nWHERE extra_results IS NOT NULL AND extra_results->>'$.hemoglobin' IS NOT NULL;"
    },
    {
      "code": "J4",
      "category": "JSON Queries",
      "description": "Doctors who offer video consultation",
      "sql": "SELECT doctor_id, day_of_week, slot_config->>'$.modes' AS modes\nFROM doctor_schedule\nWHERE JSON_CONTAINS(slot_config->'$.modes', '\"video\"');"
    },
    {
      "code": "G1",
      "category": "GPS Queries",
      "description": "Distance of every patient's home from the hospital, in km (Jaipur 26.9124, 75.7873)",
      "sql": "SELECT patient_id, first_name, city,\n       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),\n                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km\nFROM patient\nORDER BY distance_km;"
    },
    {
      "code": "G2",
      "category": "GPS Queries",
      "description": "Patients living within 5 km of the hospital",
      "sql": "SELECT patient_id, first_name, city,\n       ROUND(ST_Distance_Sphere(POINT(home_longitude, home_latitude),\n                                POINT(75.7873, 26.9124)) / 1000, 2) AS distance_km\nFROM patient\nWHERE ST_Distance_Sphere(POINT(home_longitude, home_latitude),\n                         POINT(75.7873, 26.9124)) <= 5000;"
    },
    {
      "code": "B1",
      "category": "BLOB Queries",
      "description": "Which patients have a photo, and how big is it (in bytes)",
      "sql": "SELECT patient_id, first_name, LENGTH(photo) AS photo_bytes\nFROM patient\nWHERE photo IS NOT NULL;"
    },
    {
      "code": "B2",
      "category": "BLOB Queries",
      "description": "Which lab results have a report image",
      "sql": "SELECT lab_order_id, test_id, LENGTH(report_image) AS image_bytes\nFROM lab_order_test\nWHERE report_image IS NOT NULL;"
    }
  ],
  "QUERY_RESULTS": {
    "Q1": {
      "columns": [
        "doctor_id",
        "first_name",
        "last_name",
        "specialization"
      ],
      "rows": [
        {
          "doctor_id": 1,
          "first_name": "Rajesh",
          "last_name": "Sharma",
          "specialization": "Cardiologist"
        },
        {
          "doctor_id": 2,
          "first_name": "Anita",
          "last_name": "Verma",
          "specialization": "Neurologist"
        },
        {
          "doctor_id": 3,
          "first_name": "Vikram",
          "last_name": "Singh",
          "specialization": "Orthopedic Surgeon"
        },
        {
          "doctor_id": 4,
          "first_name": "Neha",
          "last_name": "Gupta",
          "specialization": "Pediatrician"
        },
        {
          "doctor_id": 5,
          "first_name": "Sanjay",
          "last_name": "Mehta",
          "specialization": "Dermatologist"
        },
        {
          "doctor_id": 7,
          "first_name": "Amit",
          "last_name": "Joshi",
          "specialization": "Physician"
        },
        {
          "doctor_id": 8,
          "first_name": "Kavita",
          "last_name": "Rao",
          "specialization": "Gynecologist"
        },
        {
          "doctor_id": 9,
          "first_name": "Manoj",
          "last_name": "Kapoor",
          "specialization": "Oncologist"
        },
        {
          "doctor_id": 10,
          "first_name": "Deepa",
          "last_name": "Iyer",
          "specialization": "Emergency Medicine"
        }
      ]
    },
    "Q2": {
      "columns": [
        "first_name",
        "last_name",
        "dept_name"
      ],
      "rows": [
        {
          "first_name": "Rajesh",
          "last_name": "Sharma",
          "dept_name": "Cardiology"
        },
        {
          "first_name": "Anita",
          "last_name": "Verma",
          "dept_name": "Neurology"
        },
        {
          "first_name": "Vikram",
          "last_name": "Singh",
          "dept_name": "Orthopedics"
        },
        {
          "first_name": "Neha",
          "last_name": "Gupta",
          "dept_name": "Pediatrics"
        },
        {
          "first_name": "Sanjay",
          "last_name": "Mehta",
          "dept_name": "Dermatology"
        },
        {
          "first_name": "Priya",
          "last_name": "Nair",
          "dept_name": "ENT"
        },
        {
          "first_name": "Amit",
          "last_name": "Joshi",
          "dept_name": "General Medicine"
        },
        {
          "first_name": "Kavita",
          "last_name": "Rao",
          "dept_name": "Gynecology"
        },
        {
          "first_name": "Manoj",
          "last_name": "Kapoor",
          "dept_name": "Oncology"
        },
        {
          "first_name": "Deepa",
          "last_name": "Iyer",
          "dept_name": "Emergency"
        }
      ]
    },
    "Q3": {
      "columns": [
        "dept_name",
        "head_first_name",
        "head_last_name"
      ],
      "rows": [
        {
          "dept_name": "Cardiology",
          "head_first_name": "Rajesh",
          "head_last_name": "Sharma"
        },
        {
          "dept_name": "Neurology",
          "head_first_name": "Anita",
          "head_last_name": "Verma"
        },
        {
          "dept_name": "Orthopedics",
          "head_first_name": "Vikram",
          "head_last_name": "Singh"
        },
        {
          "dept_name": "Pediatrics",
          "head_first_name": "Neha",
          "head_last_name": "Gupta"
        },
        {
          "dept_name": "Dermatology",
          "head_first_name": "Sanjay",
          "head_last_name": "Mehta"
        },
        {
          "dept_name": "ENT",
          "head_first_name": "Priya",
          "head_last_name": "Nair"
        },
        {
          "dept_name": "General Medicine",
          "head_first_name": "Amit",
          "head_last_name": "Joshi"
        },
        {
          "dept_name": "Gynecology",
          "head_first_name": "Kavita",
          "head_last_name": "Rao"
        },
        {
          "dept_name": "Oncology",
          "head_first_name": "Manoj",
          "head_last_name": "Kapoor"
        },
        {
          "dept_name": "Emergency",
          "head_first_name": "Deepa",
          "head_last_name": "Iyer"
        }
      ]
    },
    "Q4": {
      "columns": [
        "first_name",
        "last_name",
        "total_appointments"
      ],
      "rows": [
        {
          "first_name": "Rajesh",
          "last_name": "Sharma",
          "total_appointments": 2
        },
        {
          "first_name": "Anita",
          "last_name": "Verma",
          "total_appointments": 2
        },
        {
          "first_name": "Vikram",
          "last_name": "Singh",
          "total_appointments": 2
        },
        {
          "first_name": "Neha",
          "last_name": "Gupta",
          "total_appointments": 2
        },
        {
          "first_name": "Amit",
          "last_name": "Joshi",
          "total_appointments": 2
        },
        {
          "first_name": "Sanjay",
          "last_name": "Mehta",
          "total_appointments": 1
        },
        {
          "first_name": "Priya",
          "last_name": "Nair",
          "total_appointments": 1
        },
        {
          "first_name": "Kavita",
          "last_name": "Rao",
          "total_appointments": 1
        },
        {
          "first_name": "Manoj",
          "last_name": "Kapoor",
          "total_appointments": 1
        },
        {
          "first_name": "Deepa",
          "last_name": "Iyer",
          "total_appointments": 1
        }
      ]
    },
    "Q5": {
      "columns": [
        "appointment_date",
        "appointment_time",
        "patient",
        "doctor",
        "reason"
      ],
      "rows": [
        {
          "appointment_date": "2026-10-15",
          "appointment_time": "09:00",
          "patient": "Rohan",
          "doctor": "Rajesh",
          "reason": "Review of ECG results"
        },
        {
          "appointment_date": "2026-11-10",
          "appointment_time": "10:00",
          "patient": "Nisha",
          "doctor": "Neha",
          "reason": "Child vaccination"
        },
        {
          "appointment_date": "2026-11-12",
          "appointment_time": "09:30",
          "patient": "Arjun",
          "doctor": "Vikram",
          "reason": "Knee pain review"
        }
      ]
    },
    "Q6": {
      "columns": [
        "first_name",
        "last_name",
        "phone"
      ],
      "rows": [
        {
          "first_name": "Rohan",
          "last_name": "Mishra",
          "phone": "9811100001"
        },
        {
          "first_name": "Rohan",
          "last_name": "Mishra",
          "phone": "9811100101"
        },
        {
          "first_name": "Sunita",
          "last_name": "Devi",
          "phone": "9811100002"
        },
        {
          "first_name": "Arjun",
          "last_name": "Reddy",
          "phone": "9811100003"
        },
        {
          "first_name": "Arjun",
          "last_name": "Reddy",
          "phone": "9811100103"
        },
        {
          "first_name": "Meera",
          "last_name": "Patel",
          "phone": "9811100004"
        },
        {
          "first_name": "Imran",
          "last_name": "Khan",
          "phone": "9811100005"
        },
        {
          "first_name": "Pooja",
          "last_name": "Sharma",
          "phone": "9811100006"
        }
      ]
    },
    "Q7": {
      "columns": [
        "first_name",
        "contact_name",
        "relation_to_patient",
        "phone"
      ],
      "rows": [
        {
          "first_name": "Rohan",
          "contact_name": "Seema Mishra",
          "relation_to_patient": "Wife",
          "phone": "9822200001"
        },
        {
          "first_name": "Rohan",
          "contact_name": "Mohan Mishra",
          "relation_to_patient": "Brother",
          "phone": "9822200101"
        }
      ]
    },
    "Q8": {
      "columns": [
        "prescription_id",
        "patient",
        "medicine_name",
        "dosage",
        "frequency",
        "duration_days"
      ],
      "rows": [
        {
          "prescription_id": 1,
          "patient": "Rohan",
          "medicine_name": "Atorvastatin",
          "dosage": "1 tablet",
          "frequency": "Once daily at night",
          "duration_days": 30
        },
        {
          "prescription_id": 1,
          "patient": "Rohan",
          "medicine_name": "Aspirin",
          "dosage": "1 tablet",
          "frequency": "Once daily",
          "duration_days": 30
        },
        {
          "prescription_id": 2,
          "patient": "Sunita",
          "medicine_name": "Sumatriptan",
          "dosage": "1 tablet",
          "frequency": "When migraine starts",
          "duration_days": 10
        },
        {
          "prescription_id": 2,
          "patient": "Sunita",
          "medicine_name": "Paracetamol",
          "dosage": "1 tablet",
          "frequency": "Twice daily",
          "duration_days": 5
        },
        {
          "prescription_id": 3,
          "patient": "Arjun",
          "medicine_name": "Ibuprofen",
          "dosage": "1 tablet",
          "frequency": "Twice daily",
          "duration_days": 7
        },
        {
          "prescription_id": 3,
          "patient": "Arjun",
          "medicine_name": "Diclofenac",
          "dosage": "1 injection",
          "frequency": "Once",
          "duration_days": 1
        }
      ]
    },
    "Q9": {
      "columns": [
        "medicine_name",
        "times_prescribed"
      ],
      "rows": [
        {
          "medicine_name": "Paracetamol",
          "times_prescribed": 3
        },
        {
          "medicine_name": "Cetirizine",
          "times_prescribed": 2
        },
        {
          "medicine_name": "Atorvastatin",
          "times_prescribed": 1
        },
        {
          "medicine_name": "Aspirin",
          "times_prescribed": 1
        },
        {
          "medicine_name": "Sumatriptan",
          "times_prescribed": 1
        },
        {
          "medicine_name": "Ibuprofen",
          "times_prescribed": 1
        }
      ]
    },
    "Q10": {
      "columns": [
        "first_name",
        "test_name",
        "result_value",
        "result_status"
      ],
      "rows": [
        {
          "first_name": "Rohan",
          "test_name": "Lipid Profile",
          "result_value": "LDL 148 mg/dL",
          "result_status": "Abnormal"
        },
        {
          "first_name": "Rohan",
          "test_name": "ECG",
          "result_value": "ST changes seen",
          "result_status": "Abnormal"
        },
        {
          "first_name": "Sunita",
          "test_name": "Complete Blood Count",
          "result_value": "Normal",
          "result_status": "Normal"
        },
        {
          "first_name": "Sunita",
          "test_name": "Blood Sugar Fasting",
          "result_value": "95 mg/dL",
          "result_status": "Normal"
        },
        {
          "first_name": "Arjun",
          "test_name": "Knee X-Ray",
          "result_value": "Joint space narrowing",
          "result_status": "Abnormal"
        },
        {
          "first_name": "Meera",
          "test_name": "Chest X-Ray",
          "result_value": "Mild hyperinflation",
          "result_status": "Abnormal"
        }
      ]
    },
    "Q11": {
      "columns": [
        "first_name",
        "last_name",
        "room_number",
        "room_type",
        "doctor"
      ],
      "rows": [
        {
          "first_name": "Sunita",
          "last_name": "Devi",
          "room_number": "P203",
          "room_type": "Private",
          "doctor": "Anita"
        },
        {
          "first_name": "Imran",
          "last_name": "Khan",
          "room_number": "ICU2",
          "room_type": "ICU",
          "doctor": "Sanjay"
        }
      ]
    },
    "Q12": {
      "columns": [
        "patient_id",
        "first_name",
        "date_of_birth",
        "age"
      ],
      "rows": [
        {
          "patient_id": 1,
          "first_name": "Rohan",
          "date_of_birth": "1985-04-12",
          "age": 41
        },
        {
          "patient_id": 2,
          "first_name": "Sunita",
          "date_of_birth": "1972-09-30",
          "age": 54
        },
        {
          "patient_id": 3,
          "first_name": "Arjun",
          "date_of_birth": "1995-12-05",
          "age": 31
        },
        {
          "patient_id": 4,
          "first_name": "Meera",
          "date_of_birth": "2016-07-21",
          "age": 10
        },
        {
          "patient_id": 5,
          "first_name": "Imran",
          "date_of_birth": "1990-01-17",
          "age": 36
        },
        {
          "patient_id": 6,
          "first_name": "Pooja",
          "date_of_birth": "1968-11-02",
          "age": 58
        }
      ]
    },
    "Q13": {
      "columns": [
        "doctor_id",
        "first_name",
        "specialization",
        "experience_years"
      ],
      "rows": [
        {
          "doctor_id": 1,
          "first_name": "Rajesh",
          "specialization": "Cardiologist",
          "experience_years": 16
        },
        {
          "doctor_id": 2,
          "first_name": "Anita",
          "specialization": "Neurologist",
          "experience_years": 14
        },
        {
          "doctor_id": 3,
          "first_name": "Vikram",
          "specialization": "Orthopedic Surgeon",
          "experience_years": 11
        },
        {
          "doctor_id": 4,
          "first_name": "Neha",
          "specialization": "Pediatrician",
          "experience_years": 8
        },
        {
          "doctor_id": 5,
          "first_name": "Sanjay",
          "specialization": "Dermatologist",
          "experience_years": 10
        },
        {
          "doctor_id": 6,
          "first_name": "Priya",
          "specialization": "ENT Specialist",
          "experience_years": 7
        },
        {
          "doctor_id": 7,
          "first_name": "Amit",
          "specialization": "Physician",
          "experience_years": 18
        },
        {
          "doctor_id": 8,
          "first_name": "Kavita",
          "specialization": "Gynecologist",
          "experience_years": 13
        },
        {
          "doctor_id": 9,
          "first_name": "Manoj",
          "specialization": "Oncologist",
          "experience_years": 21
        },
        {
          "doctor_id": 10,
          "first_name": "Deepa",
          "specialization": "Emergency Medicine",
          "experience_years": 9
        }
      ]
    },
    "Q14": {
      "columns": [
        "admission_id",
        "patient_id",
        "admission_date",
        "discharge_date",
        "length_of_stay"
      ],
      "rows": [
        {
          "admission_id": 1,
          "patient_id": 4,
          "admission_date": "2026-09-20 10:00:00",
          "discharge_date": "2026-09-23 10:00:00",
          "length_of_stay": 3
        },
        {
          "admission_id": 2,
          "patient_id": 6,
          "admission_date": "2026-09-25 09:00:00",
          "discharge_date": "2026-09-28 09:00:00",
          "length_of_stay": 3
        },
        {
          "admission_id": 3,
          "patient_id": 7,
          "admission_date": "2026-10-01 08:00:00",
          "discharge_date": "2026-10-06 08:00:00",
          "length_of_stay": 5
        },
        {
          "admission_id": 4,
          "patient_id": 9,
          "admission_date": "2026-10-10 11:00:00",
          "discharge_date": "2026-10-14 11:00:00",
          "length_of_stay": 4
        },
        {
          "admission_id": 5,
          "patient_id": 10,
          "admission_date": "2026-10-05 15:00:00",
          "discharge_date": "2026-10-08 15:00:00",
          "length_of_stay": 3
        },
        {
          "admission_id": 6,
          "patient_id": 2,
          "admission_date": "2026-11-01 10:00:00",
          "discharge_date": null,
          "length_of_stay": 19
        },
        {
          "admission_id": 7,
          "patient_id": 5,
          "admission_date": "2026-11-03 20:00:00",
          "discharge_date": null,
          "length_of_stay": 17
        },
        {
          "admission_id": 8,
          "patient_id": 8,
          "admission_date": "2026-10-20 09:00:00",
          "discharge_date": "2026-10-22 09:00:00",
          "length_of_stay": 2
        }
      ]
    },
    "Q15": {
      "columns": [
        "bill_id",
        "patient_id",
        "bill_date",
        "bill_type",
        "gross_amount",
        "discount_amount",
        "tax_amount",
        "total_amount",
        "amount_paid",
        "balance_due",
        "payment_status"
      ],
      "rows": [
        {
          "bill_id": 1,
          "patient_id": 1,
          "bill_date": "2026-10-01",
          "bill_type": "OPD",
          "gross_amount": 1180,
          "discount_amount": 0,
          "tax_amount": 0,
          "total_amount": 1180,
          "amount_paid": 1180,
          "balance_due": 0,
          "payment_status": "Paid"
        },
        {
          "bill_id": 2,
          "patient_id": 2,
          "bill_date": "2026-10-01",
          "bill_type": "OPD",
          "gross_amount": 1550,
          "discount_amount": 50,
          "tax_amount": 0,
          "total_amount": 1500,
          "amount_paid": 1000,
          "balance_due": 500,
          "payment_status": "Partial"
        },
        {
          "bill_id": 3,
          "patient_id": 3,
          "bill_date": "2026-10-02",
          "bill_type": "OPD",
          "gross_amount": 900,
          "discount_amount": 0,
          "tax_amount": 0,
          "total_amount": 900,
          "amount_paid": 0,
          "balance_due": 900,
          "payment_status": "Unpaid"
        },
        {
          "bill_id": 4,
          "patient_id": 4,
          "bill_date": "2026-09-23",
          "bill_type": "IPD",
          "gross_amount": 4500,
          "discount_amount": 0,
          "tax_amount": 225,
          "total_amount": 4725,
          "amount_paid": 4725,
          "balance_due": 0,
          "payment_status": "Paid"
        },
        {
          "bill_id": 6,
          "patient_id": 6,
          "bill_date": "2026-09-28",
          "bill_type": "IPD",
          "gross_amount": 8800,
          "discount_amount": 300,
          "tax_amount": 0,
          "total_amount": 8500,
          "amount_paid": 8500,
          "balance_due": 0,
          "payment_status": "Paid"
        },
        {
          "bill_id": 7,
          "patient_id": 7,
          "bill_date": "2026-10-06",
          "bill_type": "IPD",
          "gross_amount": 46000,
          "discount_amount": 0,
          "tax_amount": 0,
          "total_amount": 46000,
          "amount_paid": 30000,
          "balance_due": 16000,
          "payment_status": "Partial"
        }
      ]
    },
    "Q16": {
      "columns": [
        "bill_id",
        "patient_id",
        "total_amount",
        "amount_paid",
        "balance_due"
      ],
      "rows": [
        {
          "bill_id": 2,
          "patient_id": 2,
          "total_amount": 1500,
          "amount_paid": 1000,
          "balance_due": 500
        },
        {
          "bill_id": 3,
          "patient_id": 3,
          "total_amount": 900,
          "amount_paid": 0,
          "balance_due": 900
        },
        {
          "bill_id": 7,
          "patient_id": 7,
          "total_amount": 46000,
          "amount_paid": 30000,
          "balance_due": 16000
        },
        {
          "bill_id": 9,
          "patient_id": 8,
          "total_amount": 1150,
          "amount_paid": 0,
          "balance_due": 1150
        },
        {
          "bill_id": 10,
          "patient_id": 9,
          "total_amount": 12500,
          "amount_paid": 8000,
          "balance_due": 4500
        }
      ]
    },
    "Q17": {
      "columns": [
        "payment_mode",
        "payments",
        "total_received"
      ],
      "rows": [
        {
          "payment_mode": "UPI",
          "payments": 5,
          "total_received": 22780
        },
        {
          "payment_mode": "Cash",
          "payments": 4,
          "total_received": 9100
        },
        {
          "payment_mode": "Card",
          "payments": 3,
          "total_received": 14500
        },
        {
          "payment_mode": "Insurance",
          "payments": 3,
          "total_received": 41225
        }
      ]
    },
    "Q18": {
      "columns": [
        "dept_name",
        "revenue"
      ],
      "rows": [
        {
          "dept_name": "Cardiology",
          "revenue": 52000
        },
        {
          "dept_name": "Neurology",
          "revenue": 38000
        },
        {
          "dept_name": "Orthopedics",
          "revenue": 31000
        },
        {
          "dept_name": "General Medicine",
          "revenue": 14500
        },
        {
          "dept_name": "Pediatrics",
          "revenue": 7000
        },
        {
          "dept_name": "Oncology",
          "revenue": 6500
        },
        {
          "dept_name": "ENT",
          "revenue": 3800
        },
        {
          "dept_name": "Dermatology",
          "revenue": 950
        }
      ]
    },
    "Q19": {
      "columns": [
        "first_name",
        "last_name",
        "provider_name",
        "policy_number",
        "coverage_limit"
      ],
      "rows": [
        {
          "first_name": "Rohan",
          "last_name": "Mishra",
          "provider_name": "Star Health",
          "policy_number": "SH100098",
          "coverage_limit": 500000
        },
        {
          "first_name": "Arjun",
          "last_name": "Reddy",
          "provider_name": "HDFC ERGO",
          "policy_number": "HE440012",
          "coverage_limit": 750000
        },
        {
          "first_name": "Pooja",
          "last_name": "Sharma",
          "provider_name": "Care Health",
          "policy_number": "CH880199",
          "coverage_limit": 1000000
        }
      ]
    },
    "Q20": {
      "columns": [
        "patient_id",
        "first_name",
        "last_name"
      ],
      "rows": [
        {
          "patient_id": 2,
          "first_name": "Sunita",
          "last_name": "Devi"
        },
        {
          "patient_id": 4,
          "first_name": "Meera",
          "last_name": "Patel"
        },
        {
          "patient_id": 5,
          "first_name": "Imran",
          "last_name": "Khan"
        },
        {
          "patient_id": 7,
          "first_name": "Harsh",
          "last_name": "Agarwal"
        }
      ]
    },
    "Q21": {
      "columns": [
        "first_name",
        "last_name",
        "total_amount"
      ],
      "rows": [
        {
          "first_name": "Harsh",
          "last_name": "Agarwal",
          "total_amount": 46000
        },
        {
          "first_name": "Manoj",
          "last_name": "Kapoor",
          "total_amount": 12500
        },
        {
          "first_name": "Pooja",
          "last_name": "Sharma",
          "total_amount": 8500
        }
      ]
    },
    "Q22": {
      "columns": [
        "first_name",
        "last_name",
        "total"
      ],
      "rows": [
        {
          "first_name": "Rajesh",
          "last_name": "Sharma",
          "total": 2
        },
        {
          "first_name": "Anita",
          "last_name": "Verma",
          "total": 2
        },
        {
          "first_name": "Vikram",
          "last_name": "Singh",
          "total": 2
        },
        {
          "first_name": "Neha",
          "last_name": "Gupta",
          "total": 2
        },
        {
          "first_name": "Amit",
          "last_name": "Joshi",
          "total": 2
        }
      ]
    },
    "J1": {
      "columns": [
        "patient_id",
        "first_name",
        "medical_profile"
      ],
      "rows": [
        {
          "patient_id": 1,
          "first_name": "Rohan",
          "medical_profile": "{\"allergies\": [\"Penicillin\"], \"chronic\": [\"Hypertension\"]}"
        }
      ]
    },
    "J2": {
      "columns": [
        "patient_id",
        "first_name",
        "chronic_conditions"
      ],
      "rows": [
        {
          "patient_id": 2,
          "first_name": "Sunita",
          "chronic_conditions": "[\"Diabetes\", \"Migraine\"]"
        },
        {
          "patient_id": 7,
          "first_name": "Harsh",
          "chronic_conditions": "[\"Heart disease\", \"Diabetes\"]"
        }
      ]
    },
    "J3": {
      "columns": [
        "lab_order_id",
        "test_id",
        "hemoglobin"
      ],
      "rows": [
        {
          "lab_order_id": 2,
          "test_id": 1,
          "hemoglobin": "13.2"
        },
        {
          "lab_order_id": 5,
          "test_id": 1,
          "hemoglobin": "12.8"
        },
        {
          "lab_order_id": 7,
          "test_id": 1,
          "hemoglobin": "14.1"
        }
      ]
    },
    "J4": {
      "columns": [
        "doctor_id",
        "day_of_week",
        "modes"
      ],
      "rows": [
        {
          "doctor_id": 2,
          "day_of_week": "Tuesday",
          "modes": "[\"in-person\", \"video\"]"
        },
        {
          "doctor_id": 2,
          "day_of_week": "Thursday",
          "modes": "[\"in-person\", \"video\"]"
        },
        {
          "doctor_id": 4,
          "day_of_week": "Monday",
          "modes": "[\"in-person\", \"video\"]"
        },
        {
          "doctor_id": 7,
          "day_of_week": "Monday",
          "modes": "[\"in-person\", \"video\"]"
        }
      ]
    },
    "G1": {
      "columns": [
        "patient_id",
        "first_name",
        "city",
        "distance_km"
      ],
      "rows": [
        {
          "patient_id": 1,
          "first_name": "Rohan",
          "city": "Jaipur",
          "distance_km": 1.3
        },
        {
          "patient_id": 5,
          "first_name": "Imran",
          "city": "Jaipur",
          "distance_km": 2.34
        },
        {
          "patient_id": 6,
          "first_name": "Pooja",
          "city": "Jaipur",
          "distance_km": 3.03
        },
        {
          "patient_id": 7,
          "first_name": "Harsh",
          "city": "Jaipur",
          "distance_km": 3.08
        },
        {
          "patient_id": 3,
          "first_name": "Arjun",
          "city": "Jaipur",
          "distance_km": 4.77
        },
        {
          "patient_id": 8,
          "first_name": "Kiran",
          "city": "Jaipur",
          "distance_km": 5.92
        },
        {
          "patient_id": 4,
          "first_name": "Meera",
          "city": "Jaipur",
          "distance_km": 6.22
        },
        {
          "patient_id": 9,
          "first_name": "Vivek",
          "city": "Jaipur",
          "distance_km": 6.84
        },
        {
          "patient_id": 2,
          "first_name": "Sunita",
          "city": "Jaipur",
          "distance_km": 7.27
        }
      ]
    },
    "G2": {
      "columns": [
        "patient_id",
        "first_name",
        "city",
        "distance_km"
      ],
      "rows": [
        {
          "patient_id": 1,
          "first_name": "Rohan",
          "city": "Jaipur",
          "distance_km": 1.3
        },
        {
          "patient_id": 5,
          "first_name": "Imran",
          "city": "Jaipur",
          "distance_km": 2.34
        },
        {
          "patient_id": 6,
          "first_name": "Pooja",
          "city": "Jaipur",
          "distance_km": 3.03
        },
        {
          "patient_id": 7,
          "first_name": "Harsh",
          "city": "Jaipur",
          "distance_km": 3.08
        },
        {
          "patient_id": 3,
          "first_name": "Arjun",
          "city": "Jaipur",
          "distance_km": 4.77
        }
      ]
    },
    "B1": {
      "columns": [
        "patient_id",
        "first_name",
        "photo_bytes"
      ],
      "rows": [
        {
          "patient_id": 1,
          "first_name": "Rohan",
          "photo_bytes": 8
        }
      ]
    },
    "B2": {
      "columns": [
        "lab_order_id",
        "test_id",
        "image_bytes"
      ],
      "rows": [
        {
          "lab_order_id": 1,
          "test_id": 8,
          "image_bytes": 10
        },
        {
          "lab_order_id": 3,
          "test_id": 7,
          "image_bytes": 10
        },
        {
          "lab_order_id": 4,
          "test_id": 6,
          "image_bytes": 10
        }
      ]
    }
  },
  "ROOMS": [
    {
      "room_id": 1,
      "room_number": "G101",
      "room_type": "General",
      "floor_no": 1,
      "bed_capacity": 6,
      "daily_charge": 800,
      "availability": "Available"
    },
    {
      "room_id": 2,
      "room_number": "G102",
      "room_type": "General",
      "floor_no": 1,
      "bed_capacity": 6,
      "daily_charge": 800,
      "availability": "Available"
    },
    {
      "room_id": 3,
      "room_number": "P201",
      "room_type": "Private",
      "floor_no": 2,
      "bed_capacity": 1,
      "daily_charge": 2500,
      "availability": "Available"
    },
    {
      "room_id": 4,
      "room_number": "P202",
      "room_type": "Private",
      "floor_no": 2,
      "bed_capacity": 1,
      "daily_charge": 2500,
      "availability": "Available"
    },
    {
      "room_id": 5,
      "room_number": "P203",
      "room_type": "Private",
      "floor_no": 2,
      "bed_capacity": 1,
      "daily_charge": 2800,
      "availability": "Occupied"
    },
    {
      "room_id": 6,
      "room_number": "ICU1",
      "room_type": "ICU",
      "floor_no": 3,
      "bed_capacity": 1,
      "daily_charge": 8000,
      "availability": "Available"
    },
    {
      "room_id": 7,
      "room_number": "ICU2",
      "room_type": "ICU",
      "floor_no": 3,
      "bed_capacity": 1,
      "daily_charge": 8000,
      "availability": "Occupied"
    },
    {
      "room_id": 8,
      "room_number": "G103",
      "room_type": "General",
      "floor_no": 1,
      "bed_capacity": 6,
      "daily_charge": 800,
      "availability": "Available"
    },
    {
      "room_id": 9,
      "room_number": "P204",
      "room_type": "Private",
      "floor_no": 2,
      "bed_capacity": 1,
      "daily_charge": 3000,
      "availability": "Maintenance"
    },
    {
      "room_id": 10,
      "room_number": "G104",
      "room_type": "General",
      "floor_no": 1,
      "bed_capacity": 4,
      "daily_charge": 900,
      "availability": "Available"
    }
  ],
  "ADMISSIONS": [
    {
      "admission_id": 6,
      "patient_id": 2,
      "patient_first_name": "Sunita",
      "patient_last_name": "Devi",
      "room_id": 5,
      "room_number": "P203",
      "room_type": "Private",
      "doctor_id": 2,
      "doctor_first_name": "Anita",
      "doctor_last_name": "Verma",
      "admission_date": "2026-11-01 10:00:00",
      "discharge_date": null,
      "length_of_stay": 19,
      "status": "Admitted",
      "diagnosis": "Severe migraine crisis"
    },
    {
      "admission_id": 7,
      "patient_id": 5,
      "patient_first_name": "Imran",
      "patient_last_name": "Khan",
      "room_id": 7,
      "room_number": "ICU2",
      "room_type": "ICU",
      "doctor_id": 5,
      "doctor_first_name": "Sanjay",
      "doctor_last_name": "Mehta",
      "admission_date": "2026-11-03 20:00:00",
      "discharge_date": null,
      "length_of_stay": 17,
      "status": "Admitted",
      "diagnosis": "Severe anaphylactic allergic reaction"
    },
    {
      "admission_id": 1,
      "patient_id": 4,
      "patient_first_name": "Meera",
      "patient_last_name": "Patel",
      "room_id": 1,
      "room_number": "G101",
      "room_type": "General",
      "doctor_id": 4,
      "doctor_first_name": "Neha",
      "doctor_last_name": "Gupta",
      "admission_date": "2026-09-20 10:00:00",
      "discharge_date": "2026-09-23 10:00:00",
      "length_of_stay": 3,
      "status": "Discharged",
      "diagnosis": "Acute pediatric asthma attack"
    },
    {
      "admission_id": 2,
      "patient_id": 6,
      "patient_first_name": "Pooja",
      "patient_last_name": "Sharma",
      "room_id": 3,
      "room_number": "P201",
      "room_type": "Private",
      "doctor_id": 6,
      "doctor_first_name": "Priya",
      "doctor_last_name": "Nair",
      "admission_date": "2026-09-25 09:00:00",
      "discharge_date": "2026-09-28 09:00:00",
      "length_of_stay": 3,
      "status": "Discharged",
      "diagnosis": "Middle ear reconstructive surgery"
    },
    {
      "admission_id": 3,
      "patient_id": 7,
      "patient_first_name": "Harsh",
      "patient_last_name": "Agarwal",
      "room_id": 6,
      "room_number": "ICU1",
      "room_type": "ICU",
      "doctor_id": 7,
      "doctor_first_name": "Amit",
      "doctor_last_name": "Joshi",
      "admission_date": "2026-10-01 08:00:00",
      "discharge_date": "2026-10-06 08:00:00",
      "length_of_stay": 5,
      "status": "Discharged",
      "diagnosis": "Congestive heart failure stabilization"
    },
    {
      "admission_id": 4,
      "patient_id": 9,
      "patient_first_name": "Vivek",
      "patient_last_name": "Chauhan",
      "room_id": 4,
      "room_number": "P202",
      "room_type": "Private",
      "doctor_id": 9,
      "doctor_first_name": "Manoj",
      "doctor_last_name": "Kapoor",
      "admission_date": "2026-10-10 11:00:00",
      "discharge_date": "2026-10-14 11:00:00",
      "length_of_stay": 4,
      "status": "Discharged",
      "diagnosis": "Targeted adjuvant chemotherapy cycle"
    }
  ],
  "LAB_ORDERS": [
    {
      "lab_order_id": 1,
      "appointment_id": 1,
      "patient_id": 1,
      "patient_first_name": "Rohan",
      "patient_last_name": "Mishra",
      "doctor_first_name": "Rajesh",
      "doctor_last_name": "Sharma",
      "order_date": "2026-10-01 09:30:00",
      "priority": "Urgent",
      "status": "Completed",
      "tests": [
        {
          "test_id": 2,
          "test_name": "Lipid Profile",
          "category": "Blood",
          "normal_range": "LDL < 100 mg/dL",
          "result_value": "LDL 148 mg/dL",
          "result_status": "Abnormal",
          "result_date": "2026-10-01 15:00:00",
          "remarks": "Elevated low-density lipoprotein cholesterol.",
          "extra_results": {
            "total_cholesterol": 235,
            "ldl": 148,
            "hdl": 38,
            "triglycerides": 210
          },
          "has_report_image": false
        },
        {
          "test_id": 8,
          "test_name": "12-Lead Electrocardiogram (ECG)",
          "category": "Cardiac",
          "normal_range": "Normal sinus rhythm",
          "result_value": "ST segment elevation observed",
          "result_status": "Abnormal",
          "result_date": "2026-10-01 10:00:00",
          "remarks": "Referred urgently for coronary evaluation.",
          "extra_results": {
            "heart_rate": 88,
            "pr_interval_ms": 160,
            "qrs_duration_ms": 95
          },
          "has_report_image": true
        }
      ]
    },
    {
      "lab_order_id": 2,
      "appointment_id": 2,
      "patient_id": 2,
      "patient_first_name": "Sunita",
      "patient_last_name": "Devi",
      "doctor_first_name": "Anita",
      "doctor_last_name": "Verma",
      "order_date": "2026-10-01 10:30:00",
      "priority": "Routine",
      "status": "Completed",
      "tests": [
        {
          "test_id": 1,
          "test_name": "Complete Blood Count (CBC)",
          "category": "Blood",
          "normal_range": "4.5-11 (WBC x1000)",
          "result_value": "Normal baseline",
          "result_status": "Normal",
          "result_date": "2026-10-01 15:00:00",
          "remarks": "Healthy hematological profile.",
          "extra_results": {
            "hemoglobin": 13.2,
            "wbc": 7400,
            "platelets": 250000
          },
          "has_report_image": false
        },
        {
          "test_id": 3,
          "test_name": "Fasting Blood Glucose",
          "category": "Blood",
          "normal_range": "70-100 mg/dL",
          "result_value": "95 mg/dL",
          "result_status": "Normal",
          "result_date": "2026-10-01 13:00:00",
          "remarks": "Normal fasting glycaemia.",
          "extra_results": {
            "glucose_fasting": 95,
            "hba1c_estimate": 5.4
          },
          "has_report_image": false
        }
      ]
    },
    {
      "lab_order_id": 3,
      "appointment_id": 3,
      "patient_id": 3,
      "patient_first_name": "Arjun",
      "patient_last_name": "Reddy",
      "doctor_first_name": "Vikram",
      "doctor_last_name": "Singh",
      "order_date": "2026-10-02 10:00:00",
      "priority": "Routine",
      "status": "Completed",
      "tests": [
        {
          "test_id": 7,
          "test_name": "Bilateral Knee X-Ray (AP/Lateral)",
          "category": "Imaging",
          "normal_range": "Clear joint space, no osteophytes",
          "result_value": "Medial joint space narrowing",
          "result_status": "Abnormal",
          "result_date": "2026-10-02 12:00:00",
          "remarks": "Signs consistent with Kellgren-Lawrence Grade 2 osteoarthritis.",
          "extra_results": {
            "joint_space_mm": 2.4,
            "subchondral_sclerosis": "Present"
          },
          "has_report_image": true
        }
      ]
    }
  ],
  "MEDICINES": [
    {
      "medicine_id": 1,
      "medicine_name": "Atorvastatin",
      "generic_name": "Atorvastatin Calcium",
      "manufacturer": "Sun Pharma",
      "dosage_form": "Tablet",
      "strength": "10mg",
      "unit_price": 12,
      "stock_quantity": 500
    },
    {
      "medicine_id": 2,
      "medicine_name": "Aspirin",
      "generic_name": "Acetylsalicylic Acid",
      "manufacturer": "Bayer",
      "dosage_form": "Tablet",
      "strength": "75mg",
      "unit_price": 3.5,
      "stock_quantity": 800
    },
    {
      "medicine_id": 3,
      "medicine_name": "Sumatriptan",
      "generic_name": "Sumatriptan Succinate",
      "manufacturer": "Cipla",
      "dosage_form": "Tablet",
      "strength": "50mg",
      "unit_price": 25,
      "stock_quantity": 200
    },
    {
      "medicine_id": 4,
      "medicine_name": "Ibuprofen",
      "generic_name": "Ibuprofen",
      "manufacturer": "Cipla",
      "dosage_form": "Tablet",
      "strength": "400mg",
      "unit_price": 4,
      "stock_quantity": 900
    },
    {
      "medicine_id": 5,
      "medicine_name": "Salbutamol",
      "generic_name": "Salbutamol Sulphate",
      "manufacturer": "GSK",
      "dosage_form": "Syrup",
      "strength": "100ml",
      "unit_price": 85,
      "stock_quantity": 150
    },
    {
      "medicine_id": 6,
      "medicine_name": "Cetirizine",
      "generic_name": "Cetirizine Dihydrochloride",
      "manufacturer": "Dr Reddys",
      "dosage_form": "Tablet",
      "strength": "10mg",
      "unit_price": 2.5,
      "stock_quantity": 1000
    },
    {
      "medicine_id": 7,
      "medicine_name": "Amoxicillin",
      "generic_name": "Amoxicillin Trihydrate",
      "manufacturer": "Lupin",
      "dosage_form": "Capsule",
      "strength": "500mg",
      "unit_price": 9,
      "stock_quantity": 600
    },
    {
      "medicine_id": 8,
      "medicine_name": "Paracetamol",
      "generic_name": "Paracetamol",
      "manufacturer": "Sun Pharma",
      "dosage_form": "Tablet",
      "strength": "500mg",
      "unit_price": 2,
      "stock_quantity": 2000
    },
    {
      "medicine_id": 9,
      "medicine_name": "Iron Folic",
      "generic_name": "Ferrous Fumarate & Folic Acid",
      "manufacturer": "Abbott",
      "dosage_form": "Tablet",
      "strength": "100mg",
      "unit_price": 5,
      "stock_quantity": 700
    },
    {
      "medicine_id": 10,
      "medicine_name": "Hydrocortisone",
      "generic_name": "Hydrocortisone Butyrate",
      "manufacturer": "GSK",
      "dosage_form": "Ointment",
      "strength": "1%",
      "unit_price": 60,
      "stock_quantity": 120
    },
    {
      "medicine_id": 11,
      "medicine_name": "Diclofenac",
      "generic_name": "Diclofenac Sodium",
      "manufacturer": "Novartis",
      "dosage_form": "Injection",
      "strength": "75mg",
      "unit_price": 35,
      "stock_quantity": 100
    },
    {
      "medicine_id": 12,
      "medicine_name": "Ofloxacin",
      "generic_name": "Ofloxacin",
      "manufacturer": "Cipla",
      "dosage_form": "Drops",
      "strength": "0.3%",
      "unit_price": 45,
      "stock_quantity": 90
    }
  ],
  "BILLS": [
    {
      "bill_id": 1,
      "bill_date": "2026-10-01",
      "patient_id": 1,
      "patient_first_name": "Rohan",
      "patient_last_name": "Mishra",
      "bill_type": "OPD",
      "gross_amount": 1180,
      "discount_amount": 0,
      "tax_amount": 0,
      "total_amount": 1180,
      "amount_paid": 1180,
      "balance_due": 0,
      "payment_status": "Paid",
      "items": [
        {
          "item_no": 1,
          "item_type": "Consultation",
          "description": "Cardiology consultation (Dr. Rajesh Sharma)",
          "quantity": 1,
          "unit_price": 1000,
          "total_price": 1000
        },
        {
          "item_no": 2,
          "item_type": "Medicine",
          "description": "Atorvastatin 10mg (15 strips)",
          "quantity": 15,
          "unit_price": 12,
          "total_price": 180
        }
      ],
      "payments": [
        {
          "payment_id": 1,
          "payment_date": "2026-10-01 10:15:00",
          "amount": 1180,
          "payment_mode": "UPI",
          "transaction_ref": "UPI772819001"
        }
      ]
    },
    {
      "bill_id": 2,
      "bill_date": "2026-10-01",
      "patient_id": 2,
      "patient_first_name": "Sunita",
      "patient_last_name": "Devi",
      "bill_type": "OPD",
      "gross_amount": 1550,
      "discount_amount": 50,
      "tax_amount": 0,
      "total_amount": 1500,
      "amount_paid": 1000,
      "balance_due": 500,
      "payment_status": "Partial",
      "items": [
        {
          "item_no": 1,
          "item_type": "Consultation",
          "description": "Neurology consultation (Dr. Anita Verma)",
          "quantity": 1,
          "unit_price": 1200,
          "total_price": 1200
        },
        {
          "item_no": 2,
          "item_type": "LabTest",
          "description": "Complete Blood Count (CBC)",
          "quantity": 1,
          "unit_price": 350,
          "total_price": 350
        }
      ],
      "payments": [
        {
          "payment_id": 2,
          "payment_date": "2026-10-01 11:30:00",
          "amount": 1000,
          "payment_mode": "Cash",
          "transaction_ref": "CSH00129"
        }
      ]
    },
    {
      "bill_id": 3,
      "bill_date": "2026-10-02",
      "patient_id": 3,
      "patient_first_name": "Arjun",
      "patient_last_name": "Reddy",
      "bill_type": "OPD",
      "gross_amount": 900,
      "discount_amount": 0,
      "tax_amount": 0,
      "total_amount": 900,
      "amount_paid": 0,
      "balance_due": 900,
      "payment_status": "Unpaid",
      "items": [
        {
          "item_no": 1,
          "item_type": "Consultation",
          "description": "Orthopedics consultation (Dr. Vikram Singh)",
          "quantity": 1,
          "unit_price": 900,
          "total_price": 900
        }
      ],
      "payments": []
    },
    {
      "bill_id": 4,
      "bill_date": "2026-09-23",
      "patient_id": 4,
      "patient_first_name": "Meera",
      "patient_last_name": "Patel",
      "bill_type": "IPD",
      "gross_amount": 4500,
      "discount_amount": 0,
      "tax_amount": 225,
      "total_amount": 4725,
      "amount_paid": 4725,
      "balance_due": 0,
      "payment_status": "Paid",
      "items": [
        {
          "item_no": 1,
          "item_type": "Room",
          "description": "General Pediatric Ward (3 Days @ ₹800)",
          "quantity": 3,
          "unit_price": 800,
          "total_price": 2400
        },
        {
          "item_no": 2,
          "item_type": "Consultation",
          "description": "Pediatric specialist visits",
          "quantity": 1,
          "unit_price": 600,
          "total_price": 600
        },
        {
          "item_no": 3,
          "item_type": "Procedure",
          "description": "Nebulization & chest physiotherapy",
          "quantity": 1,
          "unit_price": 1500,
          "total_price": 1500
        }
      ],
      "payments": [
        {
          "payment_id": 3,
          "payment_date": "2026-09-23 11:00:00",
          "amount": 4725,
          "payment_mode": "Insurance",
          "transaction_ref": "INS-STAR-8812"
        }
      ]
    },
    {
      "bill_id": 7,
      "bill_date": "2026-10-06",
      "patient_id": 7,
      "patient_first_name": "Harsh",
      "patient_last_name": "Agarwal",
      "bill_type": "IPD",
      "gross_amount": 46000,
      "discount_amount": 0,
      "tax_amount": 0,
      "total_amount": 46000,
      "amount_paid": 30000,
      "balance_due": 16000,
      "payment_status": "Partial",
      "items": [
        {
          "item_no": 1,
          "item_type": "Room",
          "description": "ICU Bed (5 Days @ ₹8000)",
          "quantity": 5,
          "unit_price": 8000,
          "total_price": 40000
        },
        {
          "item_no": 2,
          "item_type": "Procedure",
          "description": "Mechanical ventilator & hemodynamic support",
          "quantity": 1,
          "unit_price": 6000,
          "total_price": 6000
        }
      ],
      "payments": [
        {
          "payment_id": 4,
          "payment_date": "2026-10-06 14:00:00",
          "amount": 30000,
          "payment_mode": "Card",
          "transaction_ref": "TXN-HDFC-991204"
        }
      ]
    }
  ]
};
