-- =====================================================================
-- MediCore Hospital Database  (simple version)
-- Database name : medicore_transactional
-- Works on      : MySQL 8.0
-- How to run    : MySQL Workbench -> File -> Run SQL Script
-- =====================================================================

DROP DATABASE IF EXISTS medicore_transactional;
CREATE DATABASE medicore_transactional;
USE medicore_transactional;

-- ---------------------------------------------------------------------
-- 1. DEPARTMENT
-- head_doctor_id is a foreign key to DOCTOR. DOCTOR does not exist yet,
-- so we add that foreign key later using ALTER TABLE.
-- ---------------------------------------------------------------------
CREATE TABLE department (
  dept_id         INT AUTO_INCREMENT PRIMARY KEY,
  dept_name       VARCHAR(60) NOT NULL UNIQUE,
  floor_no        INT NOT NULL,
  phone_ext       VARCHAR(10),
  head_doctor_id  INT UNIQUE
);

-- 2. DOCTOR
CREATE TABLE doctor (
  doctor_id         INT AUTO_INCREMENT PRIMARY KEY,
  first_name        VARCHAR(40) NOT NULL,
  last_name         VARCHAR(40) NOT NULL,
  gender            CHAR(1) NOT NULL,
  specialization    VARCHAR(60) NOT NULL,
  qualification     VARCHAR(80) NOT NULL,
  license_no        VARCHAR(30) NOT NULL UNIQUE,
  phone             VARCHAR(15) NOT NULL UNIQUE,
  email             VARCHAR(80) NOT NULL UNIQUE,
  consultation_fee  DECIMAL(8,2) NOT NULL CHECK (consultation_fee >= 0),
  joining_date      DATE NOT NULL,
  status            VARCHAR(15) NOT NULL DEFAULT 'Active'
                    CHECK (status IN ('Active','OnLeave','Retired')),
  dept_id           INT NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);

-- Now add the second foreign key (DEPARTMENT -> DOCTOR)
ALTER TABLE department
  ADD FOREIGN KEY (head_doctor_id) REFERENCES doctor(doctor_id);

-- 3. DOCTOR_SCHEDULE   (JSON column: slot_config)
CREATE TABLE doctor_schedule (
  schedule_id        INT AUTO_INCREMENT PRIMARY KEY,
  doctor_id          INT NOT NULL,
  day_of_week        VARCHAR(10) NOT NULL,
  start_time         TIME NOT NULL,
  end_time           TIME NOT NULL,
  slot_duration_min  INT NOT NULL,
  max_patients       INT NOT NULL,
  slot_config        JSON,
  FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
  CHECK (end_time > start_time)
);

-- 4. PATIENT
--    GPS  -> home_latitude, home_longitude
--    JSON -> medical_profile
--    BLOB -> photo
CREATE TABLE patient (
  patient_id         INT AUTO_INCREMENT PRIMARY KEY,
  first_name         VARCHAR(40) NOT NULL,
  middle_name        VARCHAR(40),
  last_name          VARCHAR(40) NOT NULL,
  date_of_birth      DATE NOT NULL,
  gender             CHAR(1) NOT NULL CHECK (gender IN ('M','F','O')),
  blood_group        VARCHAR(3),
  email              VARCHAR(80) UNIQUE,
  street             VARCHAR(100) NOT NULL,
  city               VARCHAR(50) NOT NULL,
  state              VARCHAR(50) NOT NULL,
  pincode            CHAR(6) NOT NULL,
  registration_date  DATE NOT NULL,
  national_id        VARCHAR(20) UNIQUE,
  home_latitude      DECIMAL(9,6) CHECK (home_latitude BETWEEN -90 AND 90),
  home_longitude     DECIMAL(9,6) CHECK (home_longitude BETWEEN -180 AND 180),
  medical_profile    JSON,
  photo              BLOB
);

-- 5. PATIENT_PHONE  (from the multivalued attribute "phone")
CREATE TABLE patient_phone (
  patient_id  INT NOT NULL,
  phone       VARCHAR(15) NOT NULL,
  PRIMARY KEY (patient_id, phone),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE
);

-- 6. EMERGENCY_CONTACT  (weak entity)
CREATE TABLE emergency_contact (
  patient_id           INT NOT NULL,
  contact_name         VARCHAR(80) NOT NULL,
  relation_to_patient  VARCHAR(30) NOT NULL,
  phone                VARCHAR(15) NOT NULL,
  alt_phone            VARCHAR(15),
  PRIMARY KEY (patient_id, contact_name),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE
);

-- 7. APPOINTMENT
--    UNIQUE(doctor_id, date, time) stops a doctor being double booked
CREATE TABLE appointment (
  appointment_id    INT AUTO_INCREMENT PRIMARY KEY,
  patient_id        INT NOT NULL,
  doctor_id         INT NOT NULL,
  appointment_date  DATE NOT NULL,
  appointment_time  TIME NOT NULL,
  appointment_type  VARCHAR(15) NOT NULL DEFAULT 'New'
                    CHECK (appointment_type IN ('New','Follow-up','Emergency')),
  status            VARCHAR(15) NOT NULL DEFAULT 'Scheduled'
                    CHECK (status IN ('Scheduled','Completed','Cancelled','No-Show')),
  reason            VARCHAR(200) NOT NULL,
  notes             TEXT,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
  FOREIGN KEY (doctor_id)  REFERENCES doctor(doctor_id),
  UNIQUE (doctor_id, appointment_date, appointment_time)
);

-- 8. PRESCRIPTION  (one prescription per appointment)
CREATE TABLE prescription (
  prescription_id    INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id     INT NOT NULL UNIQUE,
  prescription_date  DATE NOT NULL,
  diagnosis          VARCHAR(200) NOT NULL,
  advice             TEXT,
  follow_up_date     DATE,
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
);

-- 9. MEDICINE
CREATE TABLE medicine (
  medicine_id     INT AUTO_INCREMENT PRIMARY KEY,
  medicine_name   VARCHAR(80) NOT NULL,
  generic_name    VARCHAR(80) NOT NULL,
  manufacturer    VARCHAR(80) NOT NULL,
  dosage_form     VARCHAR(20) NOT NULL,
  strength        VARCHAR(20) NOT NULL,
  unit_price      DECIMAL(8,2) NOT NULL CHECK (unit_price >= 0),
  stock_quantity  INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
);

-- 10. PRESCRIPTION_MEDICINE  (many-to-many CONTAINS)
CREATE TABLE prescription_medicine (
  prescription_id  INT NOT NULL,
  medicine_id      INT NOT NULL,
  dosage           VARCHAR(30) NOT NULL,
  frequency        VARCHAR(30) NOT NULL,
  duration_days    INT NOT NULL CHECK (duration_days > 0),
  quantity         INT NOT NULL CHECK (quantity > 0),
  instructions     VARCHAR(200),
  PRIMARY KEY (prescription_id, medicine_id),
  FOREIGN KEY (prescription_id) REFERENCES prescription(prescription_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id)     REFERENCES medicine(medicine_id)
);

-- 11. LAB_TEST  (catalogue of tests)
CREATE TABLE lab_test (
  test_id           INT AUTO_INCREMENT PRIMARY KEY,
  test_name         VARCHAR(80) NOT NULL UNIQUE,
  category          VARCHAR(40) NOT NULL,
  sample_type       VARCHAR(30) NOT NULL,
  normal_range      VARCHAR(50),
  price             DECIMAL(8,2) NOT NULL CHECK (price >= 0),
  turnaround_hours  INT NOT NULL
);

-- 12. LAB_ORDER
CREATE TABLE lab_order (
  lab_order_id    INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id  INT NOT NULL,
  order_date      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  priority        VARCHAR(10) NOT NULL DEFAULT 'Routine'
                  CHECK (priority IN ('Routine','Urgent')),
  status          VARCHAR(15) NOT NULL DEFAULT 'Ordered'
                  CHECK (status IN ('Ordered','Collected','Completed')),
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id)
);

-- 13. LAB_ORDER_TEST  (many-to-many INCLUDES)
--     JSON -> extra_results, BLOB -> report_image
CREATE TABLE lab_order_test (
  lab_order_id   INT NOT NULL,
  test_id        INT NOT NULL,
  result_value   VARCHAR(50),
  result_status  VARCHAR(15) CHECK (result_status IN ('Normal','Abnormal','Critical')),
  result_date    DATETIME,
  remarks        VARCHAR(200),
  extra_results  JSON,
  report_image   BLOB,
  PRIMARY KEY (lab_order_id, test_id),
  FOREIGN KEY (lab_order_id) REFERENCES lab_order(lab_order_id) ON DELETE CASCADE,
  FOREIGN KEY (test_id)      REFERENCES lab_test(test_id)
);

-- 14. ROOM
CREATE TABLE room (
  room_id       INT AUTO_INCREMENT PRIMARY KEY,
  room_number   VARCHAR(10) NOT NULL UNIQUE,
  room_type     VARCHAR(20) NOT NULL CHECK (room_type IN ('General','Private','ICU')),
  floor_no      INT NOT NULL,
  bed_capacity  INT NOT NULL CHECK (bed_capacity > 0),
  daily_charge  DECIMAL(8,2) NOT NULL CHECK (daily_charge >= 0),
  availability  VARCHAR(15) NOT NULL DEFAULT 'Available'
);

-- 15. ADMISSION
CREATE TABLE admission (
  admission_id    INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT NOT NULL,
  room_id         INT NOT NULL,
  doctor_id       INT NOT NULL,
  admission_date  DATETIME NOT NULL,
  discharge_date  DATETIME,
  admission_type  VARCHAR(15) NOT NULL CHECK (admission_type IN ('Emergency','Planned')),
  diagnosis       VARCHAR(200) NOT NULL,
  status          VARCHAR(15) NOT NULL DEFAULT 'Admitted'
                  CHECK (status IN ('Admitted','Discharged')),
  FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
  FOREIGN KEY (room_id)    REFERENCES room(room_id),
  FOREIGN KEY (doctor_id)  REFERENCES doctor(doctor_id),
  CHECK (discharge_date IS NULL OR discharge_date >= admission_date)
);

-- 16. BILL
--     A bill must belong to an appointment OR an admission (or both).
--     Totals are NOT stored. We calculate them (see view v_bill_summary).
CREATE TABLE bill (
  bill_id          INT AUTO_INCREMENT PRIMARY KEY,
  patient_id       INT NOT NULL,
  appointment_id   INT UNIQUE,
  admission_id     INT UNIQUE,
  bill_date        DATE NOT NULL,
  bill_type        VARCHAR(5) NOT NULL CHECK (bill_type IN ('OPD','IPD')),
  discount_amount  DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  tax_amount       DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  payment_status   VARCHAR(10) NOT NULL DEFAULT 'Unpaid'
                   CHECK (payment_status IN ('Unpaid','Partial','Paid')),
  FOREIGN KEY (patient_id)     REFERENCES patient(patient_id),
  FOREIGN KEY (appointment_id) REFERENCES appointment(appointment_id),
  FOREIGN KEY (admission_id)   REFERENCES admission(admission_id),
  CHECK (appointment_id IS NOT NULL OR admission_id IS NOT NULL)
);

-- 17. BILL_ITEM  (weak entity)
CREATE TABLE bill_item (
  bill_id      INT NOT NULL,
  item_no      INT NOT NULL,
  item_type    VARCHAR(20) NOT NULL
               CHECK (item_type IN ('Consultation','Medicine','LabTest','Room','Procedure')),
  description  VARCHAR(150) NOT NULL,
  quantity     INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   DECIMAL(8,2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (bill_id, item_no),
  FOREIGN KEY (bill_id) REFERENCES bill(bill_id) ON DELETE CASCADE
);

-- 18. PAYMENT
CREATE TABLE payment (
  payment_id       INT AUTO_INCREMENT PRIMARY KEY,
  bill_id          INT NOT NULL,
  payment_date     DATETIME NOT NULL,
  amount           DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_mode     VARCHAR(15) NOT NULL
                   CHECK (payment_mode IN ('Cash','Card','UPI','NetBanking','Insurance')),
  transaction_ref  VARCHAR(40),
  FOREIGN KEY (bill_id) REFERENCES bill(bill_id)
);

-- 19. INSURANCE_PROVIDER
CREATE TABLE insurance_provider (
  provider_id     INT AUTO_INCREMENT PRIMARY KEY,
  provider_name   VARCHAR(80) NOT NULL UNIQUE,
  contact_phone   VARCHAR(15) NOT NULL,
  email           VARCHAR(80),
  claim_helpline  VARCHAR(15)
);

-- 20. PATIENT_INSURANCE  (many-to-many HAS_POLICY)
CREATE TABLE patient_insurance (
  patient_id      INT NOT NULL,
  provider_id     INT NOT NULL,
  policy_number   VARCHAR(30) NOT NULL,
  plan_name       VARCHAR(60) NOT NULL,
  coverage_limit  DECIMAL(12,2) NOT NULL CHECK (coverage_limit > 0),
  valid_from      DATE NOT NULL,
  valid_to        DATE NOT NULL,
  PRIMARY KEY (patient_id, provider_id),
  FOREIGN KEY (patient_id)  REFERENCES patient(patient_id),
  FOREIGN KEY (provider_id) REFERENCES insurance_provider(provider_id),
  CHECK (valid_to >= valid_from)
);

-- =====================================================================
-- VIEWS  (for the derived attributes from the ER diagram)
-- A view is just a saved SELECT query. Nothing extra is stored.
-- =====================================================================

-- age = today - date_of_birth
CREATE VIEW v_patient AS
SELECT patient_id, first_name, last_name, date_of_birth,
       TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) AS age
FROM patient;

-- experience_years = today - joining_date
CREATE VIEW v_doctor AS
SELECT doctor_id, first_name, last_name, specialization,
       TIMESTAMPDIFF(YEAR, joining_date, CURDATE()) AS experience_years
FROM doctor;

-- length_of_stay in days
CREATE VIEW v_admission AS
SELECT admission_id, patient_id, admission_date, discharge_date,
       DATEDIFF(IFNULL(discharge_date, NOW()), admission_date) AS length_of_stay
FROM admission;

-- bill total, amount paid and balance due
CREATE VIEW v_bill_summary AS
SELECT b.bill_id, b.patient_id, b.bill_type, b.payment_status,
       IFNULL(i.items_total, 0) - b.discount_amount + b.tax_amount AS total_amount,
       IFNULL(p.paid, 0) AS amount_paid,
       IFNULL(i.items_total, 0) - b.discount_amount + b.tax_amount
         - IFNULL(p.paid, 0) AS balance_due
FROM bill b
LEFT JOIN (SELECT bill_id, SUM(quantity * unit_price) AS items_total
           FROM bill_item GROUP BY bill_id) i ON i.bill_id = b.bill_id
LEFT JOIN (SELECT bill_id, SUM(amount) AS paid
           FROM payment GROUP BY bill_id) p ON p.bill_id = b.bill_id;
