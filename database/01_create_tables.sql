-- Schema: Insaniyat Ghar, normalized to 3NF
-- ==============================================================================
-- 01_create_tables.sql
-- Description: Creates all tables for Insaniyat Ghar Charity Management System
-- Database: MySQL (InnoDB — ACID Compliant)
-- ==============================================================================
-- ACID Properties Enforced:
--   Atomicity   → InnoDB transactions with BEGIN/COMMIT/ROLLBACK
--   Consistency → Foreign Keys, CHECK constraints, ENUM types, UNIQUE
--   Isolation   → InnoDB MVCC with REPEATABLE READ (default)
--   Durability  → InnoDB redo log ensures committed data persists
-- ==============================================================================

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    role_id INT NOT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. DONORS
CREATE TABLE IF NOT EXISTS donors (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    donor_type ENUM('Individual', 'Corporate') DEFAULT 'Individual',
    organization_name VARCHAR(100),
    CONSTRAINT fk_donors_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. BENEFICIARIES
CREATE TABLE IF NOT EXISTS beneficiaries (
    beneficiary_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cnic_passport_no VARCHAR(50) UNIQUE NOT NULL,
    family_members INT DEFAULT 1 CHECK (family_members > 0),
    income_level DECIMAL(12,2) DEFAULT 0 CHECK (income_level >= 0),
    verification_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    CONSTRAINT fk_beneficiaries_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    target_amount DECIMAL(14,2) DEFAULT 0 CHECK (target_amount >= 0),
    collected_amount DECIMAL(14,2) DEFAULT 0 CHECK (collected_amount >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('Draft', 'Active', 'Completed', 'Cancelled', 'Rejected') DEFAULT 'Draft',
    created_by INT NOT NULL,
    CONSTRAINT fk_campaigns_user FOREIGN KEY (created_by) REFERENCES users(user_id),
    CONSTRAINT chk_campaign_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

-- 6. DONATIONS
CREATE TABLE IF NOT EXISTS donations (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    campaign_id INT,
    donation_type ENUM('Money', 'Item') NOT NULL,
    amount DECIMAL(14,2) CHECK (amount IS NULL OR amount > 0),
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('Pending', 'Verified', 'Failed', 'Refunded') DEFAULT 'Pending',
    receipt_no VARCHAR(50) UNIQUE,
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES donors(donor_id),
    CONSTRAINT fk_donations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
) ENGINE=InnoDB;

-- 7. ITEM_CATEGORIES
CREATE TABLE IF NOT EXISTS item_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 8. ITEM_DONATIONS
CREATE TABLE IF NOT EXISTS item_donations (
    item_donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    category_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    condition_status ENUM('New', 'Good', 'Fair', 'Poor') DEFAULT 'Good',
    CONSTRAINT fk_itemdon_donation FOREIGN KEY (donation_id) REFERENCES donations(donation_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_itemdon_category FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
) ENGINE=InnoDB;

-- 9. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    total_quantity INT DEFAULT 0 CHECK (total_quantity >= 0),
    available_quantity INT DEFAULT 0 CHECK (available_quantity >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_category FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
) ENGINE=InnoDB;

-- 10. HELP_REQUESTS
CREATE TABLE IF NOT EXISTS help_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    beneficiary_id INT NOT NULL,
    campaign_id INT,
    request_type ENUM('Money', 'Item') NOT NULL,
    requested_amount DECIMAL(14,2) CHECK (requested_amount IS NULL OR requested_amount > 0),
    description TEXT,
    request_status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    CONSTRAINT fk_req_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id),
    CONSTRAINT fk_req_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id),
    CONSTRAINT fk_req_approver FOREIGN KEY (approved_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 11. FUND_DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS fund_distributions (
    distribution_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    amount_distributed DECIMAL(14,2) NOT NULL CHECK (amount_distributed > 0),
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    distributed_by INT NOT NULL,
    remarks VARCHAR(255),
    CONSTRAINT fk_funddist_request FOREIGN KEY (request_id) REFERENCES help_requests(request_id),
    CONSTRAINT fk_funddist_user FOREIGN KEY (distributed_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 12. INVENTORY_DISTRIBUTIONS
CREATE TABLE IF NOT EXISTS inventory_distributions (
    inv_distribution_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    inventory_id INT NOT NULL,
    quantity_given INT NOT NULL CHECK (quantity_given > 0),
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    distributed_by INT NOT NULL,
    CONSTRAINT fk_invdist_request FOREIGN KEY (request_id) REFERENCES help_requests(request_id),
    CONSTRAINT fk_invdist_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id),
    CONSTRAINT fk_invdist_user FOREIGN KEY (distributed_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 13. VOLUNTEERS
CREATE TABLE IF NOT EXISTS volunteers (
    volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    skills VARCHAR(255),
    availability_status ENUM('Available', 'Busy', 'Inactive') DEFAULT 'Available',
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 14. EVENTS
CREATE TABLE IF NOT EXISTS events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT,
    event_title VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    location VARCHAR(255),
    status ENUM('Planned', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Planned',
    CONSTRAINT fk_events_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
) ENGINE=InnoDB;

-- 15. VOLUNTEER_ASSIGNMENTS
CREATE TABLE IF NOT EXISTS volunteer_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id INT NOT NULL,
    event_id INT NOT NULL,
    assigned_task VARCHAR(255) NOT NULL,
    task_status ENUM('Assigned', 'In Progress', 'Completed') DEFAULT 'Assigned',
    CONSTRAINT fk_assign_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id),
    CONSTRAINT fk_assign_event FOREIGN KEY (event_id) REFERENCES events(event_id)
) ENGINE=InnoDB;

-- 16. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    donation_id INT NOT NULL,
    payment_method ENUM('Credit Card', 'Bank Transfer', 'JazzCash', 'EasyPaisa', 'Cash') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by INT,
    CONSTRAINT fk_payments_donation FOREIGN KEY (donation_id) REFERENCES donations(donation_id),
    CONSTRAINT fk_payments_verifier FOREIGN KEY (verified_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- 17. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ═══════════════════════════════════════════════════════════════
-- INDEXES for Performance
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_requests_status ON help_requests(request_status);
CREATE INDEX idx_payments_txn ON payments(transaction_id);
CREATE INDEX idx_bene_verification ON beneficiaries(verification_status);
