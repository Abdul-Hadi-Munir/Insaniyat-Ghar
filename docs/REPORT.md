# Charity Management System - Final Report

## 1. Introduction
The Charity Management System (CMS) is a comprehensive database-driven application developed as a semester project for Database Systems. Its primary goal is to manage the complex relationships between donors, beneficiaries, volunteers, and the internal staff of a charitable organization.

## 2. SRS & Architecture
The system employs a strict **Database-First** architecture. The Oracle Database serves not just as a data store, but as the central engine for business rules, constraints, and logic. A Node.js API acts as a thin bridge, and a Bootstrap HTML frontend acts as the view layer. 

## 3. Relational Schema & Normalization
The database contains 18 normalized tables (3NF/BCNF).
- **Users and Roles** handle authentication mapping.
- **Specialization** is used for Donors, Beneficiaries, and Volunteers linking back to the Users table.
- **Data Integrity** is strictly enforced via PK/FK relationships, and CHECK constraints (e.g., preventing negative inventory).

## 4. Implementation Details
- **DDL & Constraints**: Scripts define precise schemas, defaults, and ON DELETE cascades.
- **DCL**: Security is implemented via Roles (`admin_role`, `donor_role`, etc.) granting granular access to tables and views.
- **Views**: 9 professional views are created to encapsulate complex Joins, serving as clean APIs for the frontend.
- **PL/SQL Package**: `charity_pkg` contains procedures for atomic operations like `distribute_funds`, ensuring that updates happen in a single transactional block.
- **Triggers**: 7 triggers automate tasks, such as auto-updating the `collected_amount` in a Campaign when a Donation payment is verified.

## 5. Conclusion
By utilizing advanced Oracle SQL features (Triggers, Packages, Views, Cursors), the Charity Management System is highly robust. Any future modifications to business logic can be executed entirely within the database tier, proving the effectiveness of the Database-First paradigm taught in the course.
