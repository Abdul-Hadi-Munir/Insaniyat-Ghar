-- ==============================================================================
-- 09_drop_tables.sql
-- Description: Drop all tables in reverse dependency order
-- Database: MySQL
-- Use with caution — this destroys all data!
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS volunteer_assignments;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS inventory_distributions;
DROP TABLE IF EXISTS fund_distributions;
DROP TABLE IF EXISTS help_requests;
DROP TABLE IF EXISTS item_donations;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS item_categories;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS beneficiaries;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- Drop views
DROP VIEW IF EXISTS vw_donor_donation_summary;
DROP VIEW IF EXISTS vw_campaign_financial_status;
DROP VIEW IF EXISTS vw_pending_help_requests;
DROP VIEW IF EXISTS vw_inventory_status;
DROP VIEW IF EXISTS vw_beneficiary_support_history;
DROP VIEW IF EXISTS vw_volunteer_event_assignments;
DROP VIEW IF EXISTS vw_payment_verification_status;
DROP VIEW IF EXISTS vw_monthly_donation_report;
DROP VIEW IF EXISTS vw_audit_activity_report;

-- Drop stored procedures and functions
DROP PROCEDURE IF EXISTS sp_register_donation;
DROP PROCEDURE IF EXISTS sp_approve_help_request;
DROP PROCEDURE IF EXISTS sp_reject_help_request;
DROP PROCEDURE IF EXISTS sp_distribute_funds;
DROP PROCEDURE IF EXISTS sp_add_item_to_inventory;
DROP PROCEDURE IF EXISTS sp_distribute_inventory_item;
DROP PROCEDURE IF EXISTS sp_verify_payment;
DROP PROCEDURE IF EXISTS sp_assign_volunteer;
DROP FUNCTION IF EXISTS fn_generate_receipt_no;
DROP FUNCTION IF EXISTS fn_get_campaign_total;
DROP FUNCTION IF EXISTS fn_get_donor_total;
