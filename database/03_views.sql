-- ==============================================================================
-- 03_views.sql
-- Description: Database views for Insaniyat Ghar reporting
-- Database: MySQL
-- ==============================================================================

-- 1. vw_donor_donation_summary
CREATE OR REPLACE VIEW vw_donor_donation_summary AS
SELECT
    d.donor_id,
    u.full_name AS donor_name,
    d.donor_type,
    COUNT(dn.donation_id) AS total_donations,
    COALESCE(SUM(CASE WHEN dn.donation_type = 'Money' AND dn.payment_status = 'Verified' THEN dn.amount ELSE 0 END), 0) AS total_amount_donated,
    MAX(dn.donation_date) AS last_donation_date
FROM donors d
JOIN users u ON d.user_id = u.user_id
LEFT JOIN donations dn ON d.donor_id = dn.donor_id
GROUP BY d.donor_id, u.full_name, d.donor_type;

-- 2. vw_campaign_financial_status
CREATE OR REPLACE VIEW vw_campaign_financial_status AS
SELECT
    c.campaign_id,
    c.title,
    c.target_amount,
    c.collected_amount,
    (c.target_amount - c.collected_amount) AS remaining_amount,
    c.status,
    c.start_date,
    c.end_date,
    COUNT(d.donation_id) AS donor_count
FROM campaigns c
LEFT JOIN donations d ON c.campaign_id = d.campaign_id AND d.payment_status = 'Verified'
GROUP BY c.campaign_id, c.title, c.target_amount, c.collected_amount, c.status, c.start_date, c.end_date;

-- 3. vw_pending_help_requests
CREATE OR REPLACE VIEW vw_pending_help_requests AS
SELECT
    hr.request_id,
    u.full_name AS beneficiary_name,
    b.cnic_passport_no,
    hr.request_type,
    hr.requested_amount,
    hr.description,
    hr.submitted_at,
    c.title AS campaign_name
FROM help_requests hr
JOIN beneficiaries b ON hr.beneficiary_id = b.beneficiary_id
JOIN users u ON b.user_id = u.user_id
LEFT JOIN campaigns c ON hr.campaign_id = c.campaign_id
WHERE hr.request_status = 'Pending';

-- 4. vw_inventory_status
CREATE OR REPLACE VIEW vw_inventory_status AS
SELECT
    i.inventory_id,
    ic.category_name,
    i.item_name,
    i.total_quantity,
    i.available_quantity,
    i.last_updated
FROM inventory i
JOIN item_categories ic ON i.category_id = ic.category_id;

-- 5. vw_beneficiary_support_history
CREATE OR REPLACE VIEW vw_beneficiary_support_history AS
SELECT
    b.beneficiary_id,
    u.full_name AS beneficiary_name,
    hr.request_id,
    hr.request_type,
    hr.request_status,
    fd.amount_distributed,
    fd.distribution_date AS fund_date,
    idist.quantity_given,
    idist.distribution_date AS item_date,
    inv.item_name
FROM beneficiaries b
JOIN users u ON b.user_id = u.user_id
JOIN help_requests hr ON b.beneficiary_id = hr.beneficiary_id
LEFT JOIN fund_distributions fd ON hr.request_id = fd.request_id
LEFT JOIN inventory_distributions idist ON hr.request_id = idist.request_id
LEFT JOIN inventory inv ON idist.inventory_id = inv.inventory_id;

-- 6. vw_volunteer_event_assignments
CREATE OR REPLACE VIEW vw_volunteer_event_assignments AS
SELECT
    va.assignment_id,
    u.full_name AS volunteer_name,
    v.skills,
    e.event_title,
    e.event_date,
    e.location,
    va.assigned_task,
    va.task_status
FROM volunteer_assignments va
JOIN volunteers v ON va.volunteer_id = v.volunteer_id
JOIN users u ON v.user_id = u.user_id
JOIN events e ON va.event_id = e.event_id;

-- 7. vw_payment_verification_status
CREATE OR REPLACE VIEW vw_payment_verification_status AS
SELECT
    p.payment_id,
    d.receipt_no,
    u.full_name AS donor_name,
    d.amount,
    p.payment_method,
    p.transaction_id,
    d.payment_status,
    p.payment_date,
    vu.full_name AS verified_by_name
FROM payments p
JOIN donations d ON p.donation_id = d.donation_id
JOIN donors dnr ON d.donor_id = dnr.donor_id
JOIN users u ON dnr.user_id = u.user_id
LEFT JOIN users vu ON p.verified_by = vu.user_id;

-- 8. vw_monthly_donation_report
CREATE OR REPLACE VIEW vw_monthly_donation_report AS
SELECT
    DATE_FORMAT(donation_date, '%Y-%m') AS donation_month,
    COUNT(donation_id) AS total_transactions,
    COALESCE(SUM(amount), 0) AS total_amount_collected
FROM donations
WHERE payment_status = 'Verified' AND donation_type = 'Money'
GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
ORDER BY donation_month DESC;

-- 9. vw_audit_activity_report
CREATE OR REPLACE VIEW vw_audit_activity_report AS
SELECT
    al.log_id,
    u.full_name AS user_name,
    u.email,
    al.action_type,
    al.table_name,
    al.record_id,
    al.action_time,
    al.description
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.user_id
ORDER BY al.action_time DESC;
