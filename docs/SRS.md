# Software Requirements Specification (SRS)

## 1. Introduction
The Charity Management System (CMS) is a comprehensive web-based platform designed to facilitate and streamline the operations of charitable organizations. It manages donors, beneficiaries, campaigns, donations, inventory, volunteers, and financial distributions.

## 2. Purpose
The purpose of this system is to provide a "Database-First" architecture where core business logic, validations, and constraints reside directly within an Oracle database. This ensures maximum data integrity, scalability, and ease of backend logic modification without altering frontend code.

## 3. Scope
The system covers:
- User Management & Authentication (Role-Based)
- Campaign & Event Management
- Financial and Item Donation Processing
- Help Request & Approval Workflow
- Inventory Management
- Automated Audit Logging
- Reporting and Dashboarding

## 4. Functional Requirements
- **User Registration/Login**: Secure login based on roles.
- **Donation Management**: Donors can donate money or items; receipts auto-generate via PL/SQL.
- **Campaign Tracking**: System tracks target vs. collected amounts automatically via database triggers.
- **Help Requests**: Beneficiaries can request money or items. Approval handled via stored procedures.
- **Fund & Inventory Distribution**: Admin/Finance officers can distribute funds and items, updating inventory counts automatically.
- **Reporting**: Advanced views provide real-time reports on pending requests, monthly donations, etc.

## 5. Non-Functional Requirements
- **Reliability**: ACID properties maintained via Oracle database transactions.
- **Security**: Granular database-level access control (DCL) using roles (Admin, Donor, Manager, etc.).
- **Maintainability**: High maintainability due to Database-First design. The frontend is fully decoupled from business rules.
- **Performance**: Optimized via database indexing on highly queried columns (e.g., status, dates, emails).

## 6. User Roles
1. Super Admin
2. Charity Manager
3. Donor
4. Beneficiary
5. Volunteer
6. Finance Officer
7. Inventory Officer

## 7. System Constraints
- Requires Oracle Database (19c or higher recommended).
- Requires Node.js backend to bridge DB and frontend.
- Frontend must be served via a lightweight HTTP server or directly via file protocol.

## 8. Security Requirements
- Passwords must be hashed (simulated in mock data).
- Users can only perform actions granted by their Oracle Role.
- All critical table modifications must log automatically to `AUDIT_LOGS` via database triggers.
