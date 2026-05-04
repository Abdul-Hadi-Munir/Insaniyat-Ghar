-- ACID demo: explicit transaction isolation test cases
-- ==============================================================================
-- 08_acid_demo.sql
-- Description: ACID Properties Demonstration Queries
-- Database: MySQL
-- ==============================================================================
-- Run these queries one by one in MySQL Workbench to demonstrate ACID

-- ═══════════════════════════════════════════════════════════════════
-- ATOMICITY — All-or-Nothing Transactions
-- ═══════════════════════════════════════════════════════════════════
-- If any step fails, ALL changes roll back

START TRANSACTION;
    -- Step 1: Record a donation
    INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
    VALUES (1, 1, 'Money', 100000, 'Pending', CONCAT('DEMO-', UNIX_TIMESTAMP()));

    -- Step 2: Log the action
    INSERT INTO audit_logs (user_id, action_type, table_name, description)
    VALUES (1, 'INSERT', 'donations', 'ACID Demo: Atomic donation insert');
COMMIT;
-- If any INSERT fails → ROLLBACK undoes ALL operations

-- ═══════════════════════════════════════════════════════════════════
-- CONSISTENCY — Constraint Enforcement
-- ═══════════════════════════════════════════════════════════════════
-- These will FAIL because of constraints:

-- FK violation (donor_id 999 doesn't exist)
-- INSERT INTO donations (donor_id, campaign_id, donation_type, amount)
-- VALUES (999, 1, 'Money', 5000);

-- CHECK constraint violation (negative amount)
-- INSERT INTO donations (donor_id, campaign_id, donation_type, amount)
-- VALUES (1, 1, 'Money', -500);

-- UNIQUE constraint violation (duplicate email)
-- INSERT INTO users (full_name, email, password_hash, role_id)
-- VALUES ('Duplicate', 'admin@insaniyat.pk', 'hash', 1);

-- ═══════════════════════════════════════════════════════════════════
-- ISOLATION — Concurrent Transaction Safety
-- ═══════════════════════════════════════════════════════════════════
SELECT @@transaction_isolation;
-- Default: REPEATABLE READ — prevents dirty reads

-- ═══════════════════════════════════════════════════════════════════
-- DURABILITY — Data Persists After Commit
-- ═══════════════════════════════════════════════════════════════════
SHOW VARIABLES LIKE 'innodb_flush_log_at_trx_commit';
-- Value = 1 means: flush to disk after every commit (safest)
