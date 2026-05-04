-- ==============================================================================
-- 07_dcl_permissions.sql
-- Description: DCL (Data Control Language) — Role & Permission Examples
-- Database: MySQL 8.0+
-- ==============================================================================
-- NOTE: These are EXAMPLE commands for the teacher to run at runtime.
-- Uncomment and modify as needed during the presentation.
-- ==============================================================================

-- ─── Create Database Roles ──────────────────────────────────────────
-- CREATE ROLE IF NOT EXISTS 'admin_role';
-- CREATE ROLE IF NOT EXISTS 'manager_role';
-- CREATE ROLE IF NOT EXISTS 'donor_role';
-- CREATE ROLE IF NOT EXISTS 'finance_role';

-- ─── Grant Permissions ──────────────────────────────────────────────
-- GRANT ALL PRIVILEGES ON insaniyat_ghar.* TO 'admin_role';
-- GRANT SELECT, INSERT, UPDATE ON insaniyat_ghar.campaigns TO 'manager_role';
-- GRANT SELECT, INSERT ON insaniyat_ghar.donations TO 'donor_role';
-- GRANT SELECT, UPDATE ON insaniyat_ghar.donations TO 'finance_role';

-- ─── Create User & Assign Role ──────────────────────────────────────
-- CREATE USER 'charity_admin'@'localhost' IDENTIFIED BY 'password123';
-- GRANT 'admin_role' TO 'charity_admin'@'localhost';
-- SET DEFAULT ROLE ALL TO 'charity_admin'@'localhost';

-- ─── Revoke Permission Example ──────────────────────────────────────
-- REVOKE DELETE ON insaniyat_ghar.campaigns FROM 'manager_role';

-- ─── View Grants ────────────────────────────────────────────────────
-- SHOW GRANTS FOR 'charity_admin'@'localhost';
