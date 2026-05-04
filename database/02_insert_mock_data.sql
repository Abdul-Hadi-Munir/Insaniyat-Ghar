-- ==============================================================================
-- 02_insert_mock_data.sql
-- Description: Inserts sample data into Insaniyat Ghar tables (Pakistani Context)
-- Database: MySQL
-- ACID Demo: All inserts should be run within a single transaction:
--   START TRANSACTION;
--   ... (all INSERT statements) ...
--   COMMIT;
-- If any insert fails, ROLLBACK undoes all changes (Atomicity)
-- ==============================================================================

START TRANSACTION;

-- ROLES
INSERT INTO roles (role_name) VALUES ('Super Admin');
INSERT INTO roles (role_name) VALUES ('Charity Manager');
INSERT INTO roles (role_name) VALUES ('Donor');
INSERT INTO roles (role_name) VALUES ('Beneficiary');
INSERT INTO roles (role_name) VALUES ('Volunteer');
INSERT INTO roles (role_name) VALUES ('Finance Officer');
INSERT INTO roles (role_name) VALUES ('Inventory Officer');

-- USERS
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Ali Admin', 'admin@insaniyat.pk', 'hash1', '03001234567', 'Karachi HQ', 1);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Zainab Manager', 'manager@insaniyat.pk', 'hash2', '03001234568', 'Lahore Branch', 2);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Tariq Donor', 'tariq@donor.pk', 'hash3', '03001234569', 'Islamabad', 3);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Fatima Donor', 'fatima@donor.pk', 'hash4', '03001234570', 'Karachi', 3);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Usman Beneficiary', 'usman@need.pk', 'hash5', '03001234571', 'Peshawar', 4);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Ayesha Beneficiary', 'ayesha@need.pk', 'hash6', '03001234572', 'Quetta', 4);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Bilal Volunteer', 'bilal@vol.pk', 'hash7', '03001234573', 'Multan', 5);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Sana Finance', 'sana@fin.pk', 'hash8', '03001234574', 'Karachi HQ', 6);
INSERT INTO users (full_name, email, password_hash, phone, address, role_id) VALUES ('Omar Inventory', 'omar@inv.pk', 'hash9', '03001234575', 'Lahore Warehouse', 7);

-- DONORS
INSERT INTO donors (user_id, donor_type, organization_name) VALUES (3, 'Individual', NULL);
INSERT INTO donors (user_id, donor_type, organization_name) VALUES (4, 'Corporate', 'Pak Tech Solutions');

-- BENEFICIARIES
INSERT INTO beneficiaries (user_id, cnic_passport_no, family_members, income_level, verification_status) VALUES (5, '42101-1111111-1', 6, 25000, 'Verified');
INSERT INTO beneficiaries (user_id, cnic_passport_no, family_members, income_level, verification_status) VALUES (6, '42201-2222222-2', 4, 15000, 'Pending');

-- CAMPAIGNS
INSERT INTO campaigns (title, description, target_amount, start_date, end_date, status, created_by)
VALUES ('Sindh Flood Relief', 'Emergency food and shelter for flood victims in Interior Sindh', 5000000, DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Active', 2);
INSERT INTO campaigns (title, description, target_amount, start_date, end_date, status, created_by)
VALUES ('Ramadan Rashan Drive', 'Monthly grocery boxes for deserving families', 2000000, DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Completed', 2);
INSERT INTO campaigns (title, description, target_amount, start_date, end_date, status, created_by)
VALUES ('Winter Clothing Drive', 'Warm clothes for families in northern areas', 1500000, DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'Draft', 2);

-- ITEM CATEGORIES
INSERT INTO item_categories (category_name) VALUES ('Clothing');
INSERT INTO item_categories (category_name) VALUES ('Food');
INSERT INTO item_categories (category_name) VALUES ('Medicine');

-- INVENTORY
INSERT INTO inventory (category_id, item_name, total_quantity, available_quantity) VALUES (1, 'Shalwar Kameez Suits', 1000, 850);
INSERT INTO inventory (category_id, item_name, total_quantity, available_quantity) VALUES (2, 'Rashan Bags (Flour, Rice, Oil)', 500, 320);
INSERT INTO inventory (category_id, item_name, total_quantity, available_quantity) VALUES (3, 'First Aid Kits', 200, 180);

-- DONATIONS
INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
VALUES (1, 1, 'Money', 50000, 'Verified', 'REC-1001');
INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
VALUES (2, 2, 'Money', 150000, 'Verified', 'REC-1002');
INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
VALUES (1, 1, 'Money', 75000, 'Pending', 'REC-1003');
INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
VALUES (2, 1, 'Money', 200000, 'Verified', 'REC-1004');

-- PAYMENTS
INSERT INTO payments (donation_id, payment_method, transaction_id, verified_by) VALUES (1, 'Credit Card', 'TXN-001', 8);
INSERT INTO payments (donation_id, payment_method, transaction_id, verified_by) VALUES (2, 'Bank Transfer', 'TXN-002', 8);
INSERT INTO payments (donation_id, payment_method, transaction_id, verified_by) VALUES (4, 'JazzCash', 'TXN-003', 8);

-- HELP_REQUESTS
INSERT INTO help_requests (beneficiary_id, campaign_id, request_type, requested_amount, description, request_status, approved_by)
VALUES (1, 1, 'Item', NULL, 'Need Rashan bag and blankets for family of 6', 'Approved', 2);
INSERT INTO help_requests (beneficiary_id, campaign_id, request_type, requested_amount, description, request_status, approved_by)
VALUES (2, 2, 'Money', 15000, 'Medical emergency funds needed', 'Pending', NULL);
INSERT INTO help_requests (beneficiary_id, campaign_id, request_type, requested_amount, description, request_status, approved_by)
VALUES (1, 1, 'Money', 25000, 'School fee support for children', 'Pending', NULL);

-- FUND DISTRIBUTIONS
INSERT INTO fund_distributions (request_id, amount_distributed, distributed_by, remarks)
VALUES (1, 5000, 8, 'Rashan distribution completed');

-- INVENTORY DISTRIBUTIONS
INSERT INTO inventory_distributions (request_id, inventory_id, quantity_given, distributed_by)
VALUES (1, 1, 4, 9);

-- VOLUNTEERS
INSERT INTO volunteers (user_id, skills, availability_status) VALUES (7, 'Logistics, First Aid, Driving', 'Available');

-- EVENTS
INSERT INTO events (campaign_id, event_title, event_date, location, status)
VALUES (1, 'Rashan Distribution Camp', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Sukkur City Center', 'Planned');
INSERT INTO events (campaign_id, event_title, event_date, location, status)
VALUES (1, 'Medical Camp', DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'Hyderabad General Hospital', 'Planned');

-- VOLUNTEER ASSIGNMENTS
INSERT INTO volunteer_assignments (volunteer_id, event_id, assigned_task, task_status)
VALUES (1, 1, 'Distribute Rashan bags to families', 'Assigned');

-- NOTIFICATIONS
INSERT INTO notifications (user_id, message, notification_type)
VALUES (1, 'Welcome to Insaniyat Ghar Management System', 'System');
INSERT INTO notifications (user_id, message, notification_type)
VALUES (3, 'Your donation of PKR 50,000 has been verified', 'Donation');
INSERT INTO notifications (user_id, message, notification_type)
VALUES (5, 'Your help request has been approved', 'Request');

-- AUDIT LOGS
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
VALUES (1, 'INSERT', 'users', 1, 'System admin account created');
INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
VALUES (8, 'VERIFICATION', 'payments', 1, 'Payment TXN-001 verified');

-- Update campaign collected amounts
UPDATE campaigns c
SET collected_amount = (
    SELECT COALESCE(SUM(d.amount), 0)
    FROM donations d
    WHERE d.campaign_id = c.campaign_id
      AND d.payment_status = 'Verified'
      AND d.donation_type = 'Money'
);

COMMIT;
