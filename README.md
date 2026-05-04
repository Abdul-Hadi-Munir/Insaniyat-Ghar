# 🏠 Insaniyat Ghar — Charity Management System

A full-stack charity management system built with **React.js**, **Node.js/Express**, and **MySQL** featuring proper **ACID transaction** support throughout all database operations.

---

## 🏗️ Architecture

```
charity-management-system/
├── frontend/          # React.js UI (npm start)
│   └── src/
│       ├── pages/     # 11 page components
│       └── services/  # Axios API layer
├── backend/           # Node.js + Express API
│   ├── controllers/   # ACID-transaction controllers
│   ├── routes/        # REST API routes
│   ├── scripts/       # DB initialization
│   ├── db.js          # MySQL pool + transaction helper
│   └── server.js      # Express entry point
└── database/          # MySQL SQL scripts
    ├── 01_create_tables.sql       # 18 InnoDB tables
    ├── 02_insert_mock_data.sql    # Sample data (transactional)
    ├── 03_views.sql               # 9 reporting views
    ├── 04_advanced_queries.sql    # Joins, subqueries, aggregates
    ├── 05_stored_procedures.sql   # 8 stored procedures + 3 functions
    ├── 06_triggers.sql            # 8 triggers
    ├── 07_dcl_permissions.sql     # 7 roles with permissions
    ├── 08_acid_demo.sql           # ACID properties demonstration
    └── 09_drop_tables.sql         # Cleanup script
```

## 🔧 Prerequisites

- **Node.js** 18+
- **MySQL** 8.0+

## 🚀 Getting Started

### 1. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE insaniyat_ghar;
USE insaniyat_ghar;

# Run schema
SOURCE database/01_create_tables.sql;
SOURCE database/02_insert_mock_data.sql;
SOURCE database/03_views.sql;
```

Or use the automated script:
```bash
cd backend
npm run db:init
```

### 2. Configure Environment

Edit `backend/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=insaniyat_ghar
PORT=5000
```

### 3. Start Backend

```bash
cd backend
npm install
npm start
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🔒 ACID Properties Implementation

### Atomicity
All multi-step operations use `BEGIN TRANSACTION / COMMIT / ROLLBACK`. If any step fails, all changes are undone.

**Example:** Donation registration inserts into `donations` + creates `audit_log` entry atomically.

### Consistency
- **Foreign Keys**: 20+ FK constraints enforce referential integrity
- **CHECK Constraints**: Validate amounts > 0, quantities > 0, date ranges
- **ENUM Types**: Restrict status fields to valid values
- **UNIQUE Constraints**: Prevent duplicate emails, receipts, CNICs

### Isolation
- **InnoDB Engine**: Uses MVCC (Multi-Version Concurrency Control)
- **Default**: `REPEATABLE READ` isolation level
- **SELECT ... FOR UPDATE**: Used in inventory distribution to prevent overselling

### Durability
- **InnoDB Redo Log**: All committed transactions are written to disk
- **Audit Logs**: Every mutation is logged in the `audit_logs` table
- **`innodb_flush_log_at_trx_commit = 1`**: Ensures crash safety

---

## 📊 Database Schema (18 Tables)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `roles` | System roles (Admin, Manager, Donor, etc.) |
| 2 | `users` | All system users |
| 3 | `donors` | Donor profiles (Individual/Corporate) |
| 4 | `beneficiaries` | Beneficiary profiles with CNIC |
| 5 | `campaigns` | Charity campaigns with targets |
| 6 | `donations` | Money/Item donations |
| 7 | `item_categories` | Clothing, Food, Medicine |
| 8 | `item_donations` | Donated items detail |
| 9 | `inventory` | Warehouse stock tracking |
| 10 | `help_requests` | Beneficiary help requests |
| 11 | `fund_distributions` | Cash disbursements |
| 12 | `inventory_distributions` | Item disbursements |
| 13 | `volunteers` | Volunteer profiles |
| 14 | `events` | Charity events |
| 15 | `volunteer_assignments` | Event task assignments |
| 16 | `payments` | Payment verification |
| 17 | `audit_logs` | Action audit trail |
| 18 | `notifications` | User notifications |

---

## 🖥️ Frontend Pages

- **Dashboard** — Stats overview with campaign financials
- **Users** — Full CRUD with role assignment
- **Campaigns** — Create/edit/delete charity campaigns
- **Donations** — Register donations with receipt generation
- **Help Requests** — Approve/Reject/Distribute workflow
- **Inventory** — Stock management with distribution
- **Beneficiaries** — Verified beneficiary listing
- **Volunteers** — Volunteer availability tracking
- **Events** — Campaign event management
- **Financial Reports** — 3 tabbed report views
- **Audit Logs** — Complete action history

---

## 👨‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios, React Icons |
| Backend | Node.js, Express.js |
| Database | MySQL 8.0 (InnoDB — ACID) |
| API | RESTful JSON API |

---

**Insaniyat Ghar** — *Serving humanity through technology* 🏠❤️
