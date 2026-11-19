# MediCore — Three-Tier Hospital Management System

MediCore is built directly on top of the MySQL 8 `medicore_transactional` database with raw SQL (using `mysql2`), no ORM, parameterized queries, and strict adherence to database constraints.

## Project Structure

```
medicore/
├── database/
│   ├── schema.sql          # 20 tables, 4 views, checks, constraints
│   ├── sample_data.sql     # Seed data for all 20 tables
│   ├── test_queries.sql    # Q1–Q22, J1–J4, G1–G2, B1–B2
│   └── rule_tests.sql      # T1–T16 statements that must fail, 2 CASCADE demos
├── server/
│   ├── src/
│   │   ├── config/db.js           # mysql2 connection pool & additive migrations
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification & demo tokens
│   │   │   ├── roles.js           # Role guards (Admin, Doctor, Receptionist, Billing, Patient)
│   │   │   ├── errorMapper.js     # Maps MySQL errors (1062, 1452, 1451, 3819, 3140)
│   │   │   └── upload.js          # Multer memory storage (max 1MB) for BLOBs
│   │   ├── routes/
│   │   │   ├── auth.js            # Authentication
│   │   │   ├── patients.js        # Patients, GPS sorting (G1), allergy filter (J1), BLOB photo (B1)
│   │   │   ├── doctors.js         # Doctors, departments (Q3), video consultation (J4)
│   │   │   ├── appointments.js    # Direct booking (Flow 2), prescription stock check (Flow 3)
│   │   │   ├── clinical.js        # Medicines, lab tests, orders, extra_results (J3), report scans (B2)
│   │   │   ├── admissions.js      # Bed board, admissions (Q11), length of stay (Q14, Flow 4)
│   │   │   ├── billing.js         # Bills, payments, balance due sync from v_bill_summary (Flow 5)
│   │   │   └── labTools.js        # Query Explorer (Q1–B2) & Rule Lab (T1–T16)
│   │   ├── queries/
│   │   │   ├── catalog.js         # Query definitions & metadata registry
│   │   │   └── sql/               # Standalone .sql files for every query and test
│   │   └── app.js                 # Express server & static SPA hosting
│   └── .env                       # DB connection credentials & JWT secret
├── client/
│   └── src/
│       ├── api/client.js          # Fetch API wrapper with Bearer JWT
│       ├── components/            # Sidebar (#12263A), Header, JsonChips, ErrorAlert
│       ├── pages/                 # Full suite of role views, Query Explorer, Rule Lab, Leaflet Map
│       ├── context/AuthContext.jsx# Quick role switching & session
│       └── routes.jsx             # React Router routing
└── scripts/
    └── initDb.js                  # Script to initialize schema.sql and sample_data.sql
```

## How to Run

1. **Configure MySQL Credentials**:
   Edit `server/.env` to provide your MySQL password:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=medicore_transactional
   ```

2. **Initialize Database** (optional if already loaded in MySQL Workbench):
   ```bash
   node scripts/initDb.js
   ```

3. **Start the Application**:
   ```bash
   # From root:
   npm start
   ```
   Open your browser at **http://localhost:5001** to view the application!

4. **Default Demo Logins**:
   - **Admin**: `admin` / `password123` (Access to all modules, reports, and Rule Lab)
   - **Receptionist**: `reception` / `password123` (Patient registration & appointment booking)
   - **Doctor**: `dr.rajesh` / `password123` (Prescriptions & lab test orders)
   - **Billing**: `billing` / `password123` (Invoices & payment reconciliation)
   - **Patient**: `patient.rohan` / `password123` (Medical records & bills)
