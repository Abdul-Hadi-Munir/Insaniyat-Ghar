-- ==============================================================================
-- 04_advanced_queries.sql
-- Description: Advanced SQL queries for Insaniyat Ghar
-- Database: MySQL
-- ==============================================================================

-- 1. INNER JOIN (Donor donation history with campaign title)
SELECT
    d.donor_id,
    u.full_name,
    dn.amount,
    c.title AS campaign_title
FROM donors d
INNER JOIN users u ON d.user_id = u.user_id
INNER JOIN donations dn ON d.donor_id = dn.donor_id
INNER JOIN campaigns c ON dn.campaign_id = c.campaign_id;

-- 2. LEFT JOIN (All campaigns with donations if available)
SELECT
    c.title,
    c.target_amount,
    dn.donation_id,
    dn.amount
FROM campaigns c
LEFT JOIN donations dn ON c.campaign_id = dn.campaign_id;

-- 3. RIGHT JOIN (Donations with campaign details)
SELECT
    dn.donation_id,
    dn.amount,
    c.title,
    c.status
FROM campaigns c
RIGHT JOIN donations dn ON c.campaign_id = dn.campaign_id;

-- 4. FULL OUTER JOIN (MySQL emulation using UNION of LEFT and RIGHT joins)
SELECT
    c.title,
    c.status,
    dn.donation_id,
    dn.amount
FROM campaigns c
LEFT JOIN donations dn ON c.campaign_id = dn.campaign_id
UNION
SELECT
    c.title,
    c.status,
    dn.donation_id,
    dn.amount
FROM campaigns c
RIGHT JOIN donations dn ON c.campaign_id = dn.campaign_id;

-- 5. SET OPERATIONS
-- UNION (All people involved: Donors and Beneficiaries)
SELECT full_name, 'Donor' AS person_type FROM users u JOIN donors d ON u.user_id = d.user_id
UNION
SELECT full_name, 'Beneficiary' AS person_type FROM users u JOIN beneficiaries b ON u.user_id = b.user_id;

-- 6. SUBQUERIES
-- Non-correlated subquery (Campaigns with target above average)
SELECT title, target_amount
FROM campaigns
WHERE target_amount > (SELECT AVG(target_amount) FROM campaigns);

-- Correlated subquery (Donors who donated above their own average)
SELECT donor_id, amount
FROM donations d1
WHERE amount > (SELECT AVG(amount) FROM donations d2 WHERE d1.donor_id = d2.donor_id AND amount IS NOT NULL);

-- 7. AGGREGATE QUERIES
-- Total donation per campaign
SELECT c.title, SUM(d.amount) AS total_donated
FROM campaigns c
JOIN donations d ON c.campaign_id = d.campaign_id
WHERE d.payment_status = 'Verified'
GROUP BY c.title;

-- Top 5 donors
SELECT u.full_name, SUM(d.amount) AS total_contribution
FROM donors dn
JOIN users u ON dn.user_id = u.user_id
JOIN donations d ON dn.donor_id = d.donor_id
WHERE d.payment_status = 'Verified'
GROUP BY u.full_name
ORDER BY total_contribution DESC
LIMIT 5;

-- 8. ACID TRANSACTION EXAMPLE (MySQL)
-- This demonstrates a complete ACID transaction:
-- START TRANSACTION;
--   INSERT INTO donations (...) VALUES (...);         -- Step 1
--   UPDATE campaigns SET collected_amount = ... ;     -- Step 2
--   INSERT INTO audit_logs (...) VALUES (...);        -- Step 3
-- COMMIT;
-- If Step 2 fails, ROLLBACK undoes Step 1 (Atomicity)
-- FK constraints ensure data integrity (Consistency)
-- InnoDB row locks prevent dirty reads (Isolation)
-- After COMMIT, data is written to redo log (Durability)
