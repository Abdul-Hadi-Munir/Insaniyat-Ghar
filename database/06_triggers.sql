-- Triggers: event-driven automation for data integrity
-- ==============================================================================
-- 06_triggers.sql
-- Description: MySQL triggers for business rules and automation
-- Database: MySQL
-- ==============================================================================
-- Triggers enforce ACID Consistency automatically on DML operations
-- ==============================================================================

DELIMITER //

-- 1. trg_update_campaign_collected
-- After donation status changes to Verified, update campaign collected amount
CREATE TRIGGER IF NOT EXISTS trg_update_campaign_collected
AFTER UPDATE ON donations
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'Verified' AND OLD.payment_status != 'Verified'
       AND NEW.donation_type = 'Money' AND NEW.campaign_id IS NOT NULL THEN
        UPDATE campaigns
        SET collected_amount = collected_amount + NEW.amount
        WHERE campaign_id = NEW.campaign_id;
    END IF;
END //

-- 2. trg_prevent_negative_inventory
-- Prevent inventory from going negative (Consistency enforcement)
CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_inv
BEFORE UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF NEW.available_quantity < 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Available inventory quantity cannot be negative.';
    END IF;
END //

-- 3. trg_audit_user_insert
-- Log user creation in audit table (Durability — action tracking)
CREATE TRIGGER IF NOT EXISTS trg_audit_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (NEW.user_id, 'INSERT', 'users', NEW.user_id,
            CONCAT('New user created: ', NEW.full_name));
END //

-- 4. trg_audit_user_update
-- Log user updates
CREATE TRIGGER IF NOT EXISTS trg_audit_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (NEW.user_id, 'UPDATE', 'users', NEW.user_id,
            CONCAT('User updated: ', NEW.full_name));
END //

-- 5. trg_audit_user_delete
-- Log user deletions
CREATE TRIGGER IF NOT EXISTS trg_audit_user_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (NULL, 'DELETE', 'users', OLD.user_id,
            CONCAT('User deleted: ', OLD.full_name));
END //

-- 6. trg_help_request_status_log
-- Log status changes for help requests
CREATE TRIGGER IF NOT EXISTS trg_help_request_status
AFTER UPDATE ON help_requests
FOR EACH ROW
BEGIN
    IF NEW.request_status != OLD.request_status THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
        VALUES (NEW.approved_by, 'STATUS_CHANGE', 'help_requests', NEW.request_id,
                CONCAT('Status changed from ', OLD.request_status, ' to ', NEW.request_status));
    END IF;
END //

-- 7. trg_payment_verification_log
-- Log payment verification
CREATE TRIGGER IF NOT EXISTS trg_payment_log
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.verified_by IS NOT NULL AND OLD.verified_by IS NULL THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
        VALUES (NEW.verified_by, 'VERIFICATION', 'payments', NEW.payment_id,
                CONCAT('Payment verified: txn_id=', COALESCE(NEW.transaction_id, 'N/A')));
    END IF;
END //

-- 8. trg_auto_receipt_no
-- Auto-generate receipt number if not provided
CREATE TRIGGER IF NOT EXISTS trg_auto_receipt_no
BEFORE INSERT ON donations
FOR EACH ROW
BEGIN
    IF NEW.receipt_no IS NULL OR NEW.receipt_no = '' THEN
        SET NEW.receipt_no = CONCAT('REC-', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), '-', FLOOR(RAND() * 10000));
    END IF;
END //

DELIMITER ;
