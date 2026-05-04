-- Procedures: encapsulated business logic in PL/SQL
-- ==============================================================================
-- 05_stored_procedures.sql
-- Description: MySQL Stored Procedures for business logic
-- (Replaces Oracle PL/SQL Package — equivalent functionality)
-- Database: MySQL
-- ==============================================================================
-- All procedures use ACID transactions internally:
--   START TRANSACTION / COMMIT / ROLLBACK
-- ==============================================================================

DELIMITER //

-- ─── Generate Receipt Number ──────────────────────────────────────
CREATE FUNCTION IF NOT EXISTS fn_generate_receipt_no()
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    RETURN CONCAT('REC-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', FLOOR(RAND() * 100000));
END //

-- ─── Register Donation (ACID Transaction) ─────────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_register_donation(
    IN p_donor_id INT,
    IN p_campaign_id INT,
    IN p_type VARCHAR(20),
    IN p_amount DECIMAL(14,2),
    OUT p_receipt_out VARCHAR(50)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SET p_receipt_out = fn_generate_receipt_no();

    INSERT INTO donations (donor_id, campaign_id, donation_type, amount, payment_status, receipt_no)
    VALUES (p_donor_id, p_campaign_id, p_type, p_amount, 'Pending', p_receipt_out);

    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (NULL, 'INSERT', 'donations', LAST_INSERT_ID(), CONCAT('Donation registered: ', p_receipt_out));

    COMMIT;
END //

-- ─── Approve Help Request (ACID Transaction) ──────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_approve_help_request(
    IN p_request_id INT,
    IN p_approved_by INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE help_requests
    SET request_status = 'Approved', approved_by = p_approved_by
    WHERE request_id = p_request_id;

    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (p_approved_by, 'STATUS_CHANGE', 'help_requests', p_request_id, 'Help request approved');

    COMMIT;
END //

-- ─── Reject Help Request (ACID Transaction) ───────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_reject_help_request(
    IN p_request_id INT,
    IN p_remarks VARCHAR(255),
    IN p_rejected_by INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    UPDATE help_requests
    SET request_status = 'Rejected', approved_by = p_rejected_by
    WHERE request_id = p_request_id;

    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (p_rejected_by, 'STATUS_CHANGE', 'help_requests', p_request_id,
            CONCAT('Help request rejected: ', p_remarks));

    COMMIT;
END //

-- ─── Distribute Funds (ACID Transaction) ──────────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_distribute_funds(
    IN p_request_id INT,
    IN p_amount DECIMAL(14,2),
    IN p_dist_by INT,
    IN p_remarks VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO fund_distributions (request_id, amount_distributed, distributed_by, remarks)
    VALUES (p_request_id, p_amount, p_dist_by, p_remarks);

    UPDATE help_requests SET request_status = 'Completed' WHERE request_id = p_request_id;

    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (p_dist_by, 'DISTRIBUTION', 'fund_distributions', p_request_id,
            CONCAT('Funds distributed: PKR ', p_amount));

    COMMIT;
END //

-- ─── Add Item to Inventory (ACID — Upsert) ───────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_add_item_to_inventory(
    IN p_category_id INT,
    IN p_item_name VARCHAR(100),
    IN p_qty INT
)
BEGIN
    DECLARE v_count INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_count FROM inventory
    WHERE category_id = p_category_id AND item_name = p_item_name;

    IF v_count > 0 THEN
        UPDATE inventory
        SET total_quantity = total_quantity + p_qty,
            available_quantity = available_quantity + p_qty
        WHERE category_id = p_category_id AND item_name = p_item_name;
    ELSE
        INSERT INTO inventory (category_id, item_name, total_quantity, available_quantity)
        VALUES (p_category_id, p_item_name, p_qty, p_qty);
    END IF;

    COMMIT;
END //

-- ─── Distribute Inventory Item (ACID — Multi-table) ──────────────
CREATE PROCEDURE IF NOT EXISTS sp_distribute_inventory_item(
    IN p_request_id INT,
    IN p_inventory_id INT,
    IN p_qty INT,
    IN p_dist_by INT
)
BEGIN
    DECLARE v_available INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Lock the row to prevent concurrent modification (Isolation)
    SELECT available_quantity INTO v_available
    FROM inventory WHERE inventory_id = p_inventory_id FOR UPDATE;

    IF v_available < p_qty THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient inventory stock';
    END IF;

    INSERT INTO inventory_distributions (request_id, inventory_id, quantity_given, distributed_by)
    VALUES (p_request_id, p_inventory_id, p_qty, p_dist_by);

    UPDATE inventory
    SET available_quantity = available_quantity - p_qty
    WHERE inventory_id = p_inventory_id;

    UPDATE help_requests SET request_status = 'Completed' WHERE request_id = p_request_id;

    COMMIT;
END //

-- ─── Verify Payment (ACID — Multi-table) ─────────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_verify_payment(
    IN p_payment_id INT,
    IN p_verified_by INT
)
BEGIN
    DECLARE v_donation_id INT;
    DECLARE v_campaign_id INT;
    DECLARE v_amount DECIMAL(14,2);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- Get donation details
    SELECT p.donation_id INTO v_donation_id
    FROM payments p WHERE p.payment_id = p_payment_id;

    -- Update payment
    UPDATE payments SET verified_by = p_verified_by WHERE payment_id = p_payment_id;

    -- Update donation status
    UPDATE donations SET payment_status = 'Verified' WHERE donation_id = v_donation_id;

    -- Update campaign collected amount
    SELECT campaign_id, amount INTO v_campaign_id, v_amount
    FROM donations WHERE donation_id = v_donation_id;

    IF v_campaign_id IS NOT NULL AND v_amount IS NOT NULL THEN
        UPDATE campaigns
        SET collected_amount = collected_amount + v_amount
        WHERE campaign_id = v_campaign_id;
    END IF;

    -- Audit log
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, description)
    VALUES (p_verified_by, 'VERIFICATION', 'payments', p_payment_id,
            CONCAT('Payment verified for donation ', v_donation_id));

    COMMIT;
END //

-- ─── Assign Volunteer ────────────────────────────────────────────
CREATE PROCEDURE IF NOT EXISTS sp_assign_volunteer(
    IN p_vol_id INT,
    IN p_event_id INT,
    IN p_task VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO volunteer_assignments (volunteer_id, event_id, assigned_task)
    VALUES (p_vol_id, p_event_id, p_task);

    COMMIT;
END //

-- ─── Get Campaign Total (Function) ──────────────────────────────
CREATE FUNCTION IF NOT EXISTS fn_get_campaign_total(p_campaign_id INT)
RETURNS DECIMAL(14,2)
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(14,2);
    SELECT COALESCE(collected_amount, 0) INTO v_total
    FROM campaigns WHERE campaign_id = p_campaign_id;
    RETURN v_total;
END //

-- ─── Get Donor Total Donations (Function) ───────────────────────
CREATE FUNCTION IF NOT EXISTS fn_get_donor_total(p_donor_id INT)
RETURNS DECIMAL(14,2)
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(14,2);
    SELECT COALESCE(SUM(amount), 0) INTO v_total
    FROM donations WHERE donor_id = p_donor_id AND payment_status = 'Verified';
    RETURN v_total;
END //

DELIMITER ;
