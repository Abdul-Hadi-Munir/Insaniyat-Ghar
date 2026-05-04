// Controller layer — handles all CRUD business logic
// ==============================================================================
// apiController.js — REST API Controller (SQLite + ACID transactions)
// All multi-step operations use db.transaction() for atomicity
// ==============================================================================
const db = require('../db');

const sendResponse = (res, data, message = 'Success') =>
    res.json({ success: true, message, data });

const sendError = (res, error, message = 'Error', status = 500) => {
    console.error(message, error?.message || error);
    res.status(status).json({ success: false, message, data: error?.message || null });
};

// ─── Dashboard ────────────────────────────────────────────────────────
exports.getDashboardStats = (req, res) => {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    try {
        const stats = {
            totalUsers:           db.get('SELECT COUNT(*) AS c FROM users').c,
            totalDonors:          db.get('SELECT COUNT(*) AS c FROM donors').c,
            totalBeneficiaries:   db.get('SELECT COUNT(*) AS c FROM beneficiaries').c,
            totalCampaigns:       db.get('SELECT COUNT(*) AS c FROM campaigns').c,
            activeCampaigns:      db.get("SELECT COUNT(*) AS c FROM campaigns WHERE status='Active'").c,
            totalDonationsAmount: 0,
            pendingRequests:      db.get("SELECT COUNT(*) AS c FROM help_requests WHERE request_status='Pending'").c,
            totalVolunteers:      db.get('SELECT COUNT(*) AS c FROM volunteers').c,
        };

        if (role === 'Donor') {
            stats.totalDonationsAmount = db.get("SELECT COALESCE(SUM(d.amount),0) AS t FROM donations d JOIN donors dn ON d.donor_id = dn.donor_id WHERE d.payment_status='Verified' AND dn.user_id=?", [userId]).t || 0;
        } else {
            stats.totalDonationsAmount = db.get("SELECT COALESCE(SUM(amount),0) AS t FROM donations WHERE payment_status='Verified'").t;
        }

        sendResponse(res, stats, 'Dashboard stats retrieved');
    } catch (err) { sendError(res, err, 'Dashboard error'); }
};

// ─── Reports ──────────────────────────────────────────────────────────
exports.getCampaignFinancialStatus = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_campaign_financial_status')); }
    catch (err) { sendError(res, err, 'Campaign report error'); }
};
exports.getDonorDonationSummary = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_donor_donation_summary')); }
    catch (err) { sendError(res, err, 'Donor summary error'); }
};
exports.getMonthlyDonationReport = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_monthly_donation_report')); }
    catch (err) { sendError(res, err, 'Monthly report error'); }
};
exports.getPendingHelpRequests = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_pending_help_requests')); }
    catch (err) { sendError(res, err, 'Pending requests error'); }
};
exports.getInventoryStatus = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_inventory_status')); }
    catch (err) { sendError(res, err, 'Inventory status error'); }
};
exports.getAuditLogs = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_audit_activity_report LIMIT 100')); }
    catch (err) { sendError(res, err, 'Audit logs error'); }
};

// ─── USERS CRUD ───────────────────────────────────────────────────────
exports.getUsers = (req, res) => {
    try {
        sendResponse(res, db.all(`
            SELECT u.user_id, u.full_name, u.email, u.phone, u.address,
                   r.role_name, u.status, u.created_at
            FROM users u JOIN roles r ON u.role_id = r.role_id ORDER BY u.user_id
        `));
    } catch (err) { sendError(res, err, 'Get users error'); }
};

exports.createUser = (req, res) => {
    const { full_name, email, password_hash, phone, address, role_id } = req.body;
    try {
        const result = db.transaction(() => {
            const r = db.run(
                'INSERT INTO users (full_name,email,password_hash,phone,address,role_id) VALUES (?,?,?,?,?,?)',
                [full_name, email, password_hash || 'default_hash', phone || '', address || '', role_id]
            );
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [r.lastInsertRowid, 'INSERT', 'users', r.lastInsertRowid, `User created: ${full_name}`]
            );
            return { user_id: r.lastInsertRowid };
        });
        sendResponse(res, result, 'User created (ACID committed)');
    } catch (err) { sendError(res, err, 'Create user error'); }
};

exports.updateUser = (req, res) => {
    const { user_id } = req.params;
    const { full_name, email, phone, address, status } = req.body;
    try {
        db.transaction(() => {
            db.run(
                'UPDATE users SET full_name=?,email=?,phone=?,address=?,status=? WHERE user_id=?',
                [full_name, email, phone || '', address || '', status, user_id]
            );
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [user_id, 'UPDATE', 'users', user_id, `User updated: ${full_name}`]
            );
        });
        sendResponse(res, null, 'User updated (ACID committed)');
    } catch (err) { sendError(res, err, 'Update user error'); }
};

exports.deleteUser = (req, res) => {
    const { user_id } = req.params;
    try {
        db.transaction(() => {
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (NULL,?,?,?,?)',
                ['DELETE', 'users', user_id, `User deleted: ID ${user_id}`]
            );
            db.run('DELETE FROM users WHERE user_id=?', [user_id]);
        });
        sendResponse(res, null, 'User deleted (ACID committed)');
    } catch (err) { sendError(res, err, 'Delete user error'); }
};

// ─── CAMPAIGNS CRUD ───────────────────────────────────────────────────
exports.getCampaigns = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM campaigns ORDER BY campaign_id DESC')); }
    catch (err) { sendError(res, err, 'Get campaigns error'); }
};

exports.createCampaign = (req, res) => {
    const { title, description, target_amount, start_date, end_date, created_by } = req.body;
    try {
        const result = db.transaction(() => {
            const r = db.run(
                'INSERT INTO campaigns (title,description,target_amount,start_date,end_date,created_by) VALUES (?,?,?,?,?,?)',
                [title, description || '', target_amount, start_date, end_date, created_by || 1]
            );
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [created_by || 1, 'INSERT', 'campaigns', r.lastInsertRowid, `Campaign created: ${title}`]
            );
            return { campaign_id: r.lastInsertRowid };
        });
        sendResponse(res, result, 'Campaign created (ACID committed)');
    } catch (err) { sendError(res, err, 'Create campaign error'); }
};

exports.updateCampaign = (req, res) => {
    const { campaign_id } = req.params;
    const { title, description, target_amount, start_date, end_date, status } = req.body;
    try {
        db.transaction(() => {
            db.run(
                'UPDATE campaigns SET title=?,description=?,target_amount=?,start_date=?,end_date=?,status=? WHERE campaign_id=?',
                [title, description || '', target_amount, start_date, end_date, status, campaign_id]
            );
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (NULL,?,?,?,?)',
                ['UPDATE', 'campaigns', campaign_id, `Campaign updated: ${title}`]
            );
        });
        sendResponse(res, null, 'Campaign updated (ACID committed)');
    } catch (err) { sendError(res, err, 'Update campaign error'); }
};

exports.deleteCampaign = (req, res) => {
    const { campaign_id } = req.params;
    try {
        db.transaction(() => {
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (NULL,?,?,?,?)',
                ['DELETE', 'campaigns', campaign_id, `Campaign deleted: ID ${campaign_id}`]
            );
            db.run('DELETE FROM campaigns WHERE campaign_id=?', [campaign_id]);
        });
        sendResponse(res, null, 'Campaign deleted');
    } catch (err) { sendError(res, err, 'Delete campaign error'); }
};

// ─── DONATIONS ────────────────────────────────────────────────────────
exports.getDonations = (req, res) => {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    try {
        let sql = `
            SELECT d.*, u.full_name AS donor_name, c.title AS campaign_title
            FROM donations d
            JOIN donors dn ON d.donor_id = dn.donor_id
            JOIN users u ON dn.user_id = u.user_id
            LEFT JOIN campaigns c ON d.campaign_id = c.campaign_id
        `;
        let params = [];
        if (role === 'Donor') {
            sql += ' WHERE u.user_id = ?';
            params.push(userId);
        }
        sql += ' ORDER BY d.donation_date DESC';

        sendResponse(res, db.all(sql, params));
    } catch (err) { sendError(res, err, 'Get donations error'); }
};

/**
 * Register Donation — ACID Transaction
 * Atomicity: Insert donation + audit log — all or nothing
 * Consistency: FK checks donor/campaign exist before insert
 */
exports.registerDonation = (req, res) => {
    const { donor_id, campaign_id, donation_type, amount } = req.body;
    try {
        const result = db.transaction(() => {
            const receipt_no = 'REC-' + Date.now();
            const r = db.run(
                'INSERT INTO donations (donor_id,campaign_id,donation_type,amount,payment_status,receipt_no) VALUES (?,?,?,?,?,?)',
                [donor_id, campaign_id || null, donation_type, amount || null, 'Pending', receipt_no]
            );
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (NULL,?,?,?,?)',
                ['INSERT', 'donations', r.lastInsertRowid, `Donation: ${receipt_no}, PKR ${amount}`]
            );
            return { donation_id: r.lastInsertRowid, receipt_no };
        });
        sendResponse(res, result, 'Donation registered (ACID committed)');
    } catch (err) { sendError(res, err, 'Register donation error'); }
};

/**
 * Verify Donation — ACID Transaction (used by Finance Officer / Admin)
 * Updates donation status to Verified + adds amount to campaign collected_amount
 */
exports.verifyDonation = (req, res) => {
    const { donation_id } = req.body;
    const verifiedBy = req.headers['x-user-id'];
    try {
        db.transaction(() => {
            const don = db.get('SELECT campaign_id, amount, payment_status FROM donations WHERE donation_id=?', [donation_id]);
            if (!don) throw new Error('Donation not found');
            if (don.payment_status === 'Verified') throw new Error('Already verified');

            db.run("UPDATE donations SET payment_status='Verified' WHERE donation_id=?", [donation_id]);

            if (don.campaign_id && don.amount) {
                db.run('UPDATE campaigns SET collected_amount=collected_amount+? WHERE campaign_id=?',
                    [don.amount, don.campaign_id]);
            }
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [verifiedBy, 'VERIFICATION', 'donations', donation_id, `Donation verified: PKR ${don.amount}`]
            );
        });
        sendResponse(res, null, 'Donation verified (ACID committed)');
    } catch (err) { sendError(res, err, 'Verify donation error'); }
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────
/**
 * Verify Payment — ACID Transaction
 * Updates payment + donation status + campaign collected_amount atomically
 */
exports.verifyPayment = (req, res) => {
    const { payment_id, verified_by } = req.body;
    try {
        db.transaction(() => {
            const payment = db.get('SELECT donation_id FROM payments WHERE payment_id=?', [payment_id]);
            if (!payment) throw new Error('Payment not found');
            const donation_id = payment.donation_id;

            db.run('UPDATE payments SET verified_by=? WHERE payment_id=?', [verified_by, payment_id]);
            db.run("UPDATE donations SET payment_status='Verified' WHERE donation_id=?", [donation_id]);

            const don = db.get('SELECT campaign_id, amount FROM donations WHERE donation_id=?', [donation_id]);
            if (don?.campaign_id && don?.amount) {
                db.run('UPDATE campaigns SET collected_amount=collected_amount+? WHERE campaign_id=?',
                    [don.amount, don.campaign_id]);
            }
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [verified_by, 'VERIFICATION', 'payments', payment_id, `Payment verified`]
            );
        });
        sendResponse(res, null, 'Payment verified (ACID committed)');
    } catch (err) { sendError(res, err, 'Verify payment error'); }
};

// ─── HELP REQUESTS ────────────────────────────────────────────────────
exports.getHelpRequests = (req, res) => {
    const userId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    try {
        let sql = `
            SELECT hr.*, u.full_name AS beneficiary_name, c.title AS campaign_name
            FROM help_requests hr
            JOIN beneficiaries b ON hr.beneficiary_id = b.beneficiary_id
            JOIN users u ON b.user_id = u.user_id
            LEFT JOIN campaigns c ON hr.campaign_id = c.campaign_id
        `;
        let params = [];
        if (role === 'Beneficiary') {
            sql += ' WHERE u.user_id = ?';
            params.push(userId);
        }
        sql += ' ORDER BY hr.submitted_at DESC';

        sendResponse(res, db.all(sql, params));
    } catch (err) { sendError(res, err, 'Get requests error'); }
};

exports.submitHelpRequest = (req, res) => {
    const userId = req.headers['x-user-id'];
    const { campaign_id, request_type, requested_amount, description } = req.body;
    try {
        const b = db.get('SELECT beneficiary_id FROM beneficiaries WHERE user_id=?', [userId]);
        if (!b) throw new Error('Beneficiary record not found');
        
        db.transaction(() => {
            db.run(
                "INSERT INTO help_requests (beneficiary_id,campaign_id,request_type,requested_amount,description,request_status) VALUES (?,?,?,?,?,'Pending')",
                [b.beneficiary_id, campaign_id || null, request_type, requested_amount || null, description]
            );
        });
        sendResponse(res, null, 'Help request submitted (ACID committed)');
    } catch (err) { sendError(res, err, 'Submit request error'); }
};

exports.approveHelpRequest = (req, res) => {
    const { request_id, approved_by } = req.body;
    try {
        db.transaction(() => {
            db.run("UPDATE help_requests SET request_status='Approved',approved_by=? WHERE request_id=?",
                [approved_by, request_id]);
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [approved_by, 'STATUS_CHANGE', 'help_requests', request_id, 'Help request approved']
            );
        });
        sendResponse(res, null, 'Request approved (ACID committed)');
    } catch (err) { sendError(res, err, 'Approve request error'); }
};

exports.rejectHelpRequest = (req, res) => {
    const { request_id, rejected_by, remarks } = req.body;
    try {
        db.transaction(() => {
            db.run("UPDATE help_requests SET request_status='Rejected',approved_by=? WHERE request_id=?",
                [rejected_by, request_id]);
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [rejected_by, 'STATUS_CHANGE', 'help_requests', request_id, `Rejected: ${remarks}`]
            );
        });
        sendResponse(res, null, 'Request rejected (ACID committed)');
    } catch (err) { sendError(res, err, 'Reject request error'); }
};

/**
 * Distribute Funds — ACID Transaction
 * Insert distribution + update request status — all or nothing
 */
exports.distributeFunds = (req, res) => {
    const { request_id, amount, distributed_by, remarks } = req.body;
    try {
        db.transaction(() => {
            db.run(
                'INSERT INTO fund_distributions (request_id,amount_distributed,distributed_by,remarks) VALUES (?,?,?,?)',
                [request_id, amount, distributed_by, remarks || '']
            );
            db.run("UPDATE help_requests SET request_status='Completed' WHERE request_id=?", [request_id]);
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [distributed_by, 'DISTRIBUTION', 'fund_distributions', request_id, `Funds distributed: PKR ${amount}`]
            );
        });
        sendResponse(res, null, 'Funds distributed (ACID committed)');
    } catch (err) { sendError(res, err, 'Distribute funds error'); }
};

// ─── INVENTORY ────────────────────────────────────────────────────────
exports.getInventory = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM vw_inventory_status')); }
    catch (err) { sendError(res, err, 'Get inventory error'); }
};

exports.addInventoryItem = (req, res) => {
    const { category_id, item_name, quantity } = req.body;
    try {
        db.transaction(() => {
            const existing = db.get(
                'SELECT inventory_id FROM inventory WHERE category_id=? AND item_name=?',
                [category_id, item_name]
            );
            if (existing) {
                db.run(
                    'UPDATE inventory SET total_quantity=total_quantity+?,available_quantity=available_quantity+?,last_updated=datetime("now") WHERE inventory_id=?',
                    [quantity, quantity, existing.inventory_id]
                );
            } else {
                db.run(
                    'INSERT INTO inventory (category_id,item_name,total_quantity,available_quantity) VALUES (?,?,?,?)',
                    [category_id, item_name, quantity, quantity]
                );
            }
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (NULL,?,?,NULL,?)',
                ['INSERT', 'inventory', `Inventory: ${item_name} x${quantity}`]
            );
        });
        sendResponse(res, null, 'Inventory updated (ACID committed)');
    } catch (err) { sendError(res, err, 'Add inventory error'); }
};

/**
 * Distribute Inventory — ACID Transaction
 * Checks stock → inserts distribution → reduces qty → updates request status
 * If stock is insufficient → ROLLBACK (Atomicity + Consistency)
 */
exports.distributeInventoryItem = (req, res) => {
    const { request_id, inventory_id, quantity, distributed_by } = req.body;
    try {
        db.transaction(() => {
            const stock = db.get('SELECT available_quantity FROM inventory WHERE inventory_id=?', [inventory_id]);
            if (!stock) throw new Error('Inventory item not found');
            if (stock.available_quantity < quantity) throw new Error('Insufficient inventory stock');

            db.run(
                'INSERT INTO inventory_distributions (request_id,inventory_id,quantity_given,distributed_by) VALUES (?,?,?,?)',
                [request_id, inventory_id, quantity, distributed_by]
            );
            db.run('UPDATE inventory SET available_quantity=available_quantity-?,last_updated=datetime("now") WHERE inventory_id=?',
                [quantity, inventory_id]);
            db.run("UPDATE help_requests SET request_status='Completed' WHERE request_id=?", [request_id]);
        });
        sendResponse(res, null, 'Inventory distributed (ACID committed)');
    } catch (err) { sendError(res, err, 'Distribute inventory error'); }
};

// ─── LOOKUP DATA ──────────────────────────────────────────────────────
exports.getDonors = (req, res) => {
    try {
        sendResponse(res, db.all(`
            SELECT d.*, u.full_name, u.email, u.phone FROM donors d
            JOIN users u ON d.user_id = u.user_id
        `));
    } catch (err) { sendError(res, err, 'Get donors error'); }
};

exports.getBeneficiaries = (req, res) => {
    try {
        sendResponse(res, db.all(`
            SELECT b.*, u.full_name, u.email, u.phone, u.address FROM beneficiaries b
            JOIN users u ON b.user_id = u.user_id
        `));
    } catch (err) { sendError(res, err, 'Get beneficiaries error'); }
};

exports.verifyBeneficiary = (req, res) => {
    const { beneficiary_id, verified_by } = req.body;
    try {
        db.transaction(() => {
            db.run("UPDATE beneficiaries SET verification_status='Verified' WHERE beneficiary_id=?", [beneficiary_id]);
            db.run(
                'INSERT INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)',
                [verified_by, 'VERIFICATION', 'beneficiaries', beneficiary_id, 'Beneficiary verified']
            );
        });
        sendResponse(res, null, 'Beneficiary verified (ACID committed)');
    } catch (err) { sendError(res, err, 'Verify beneficiary error'); }
};

exports.getVolunteers = (req, res) => {
    try {
        sendResponse(res, db.all(`
            SELECT v.*, u.full_name, u.email, u.phone FROM volunteers v
            JOIN users u ON v.user_id = u.user_id
        `));
    } catch (err) { sendError(res, err, 'Get volunteers error'); }
};

exports.getEvents = (req, res) => {
    try {
        sendResponse(res, db.all(`
            SELECT e.*, c.title AS campaign_title FROM events e
            LEFT JOIN campaigns c ON e.campaign_id = c.campaign_id
            ORDER BY e.event_date DESC
        `));
    } catch (err) { sendError(res, err, 'Get events error'); }
};

exports.getRoles = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM roles')); }
    catch (err) { sendError(res, err, 'Get roles error'); }
};

exports.getCategories = (req, res) => {
    try { sendResponse(res, db.all('SELECT * FROM item_categories')); }
    catch (err) { sendError(res, err, 'Get categories error'); }
};

// ─── AUTH ─────────────────────────────────────────────────────────────
exports.loginUser = (req, res) => {
    const { email } = req.body;
    try {
        const user = db.get(
            'SELECT u.user_id, u.full_name, u.status, r.role_name FROM users u JOIN roles r ON u.role_id=r.role_id WHERE u.email=?',
            [email]
        );
        if (user) {
            if (user.status !== 'Active') {
                return sendError(res, null, `Account is ${user.status}`, 403);
            }
            if (user.role_name === 'Beneficiary') {
                const ben = db.get('SELECT verification_status FROM beneficiaries WHERE user_id=?', [user.user_id]);
                if (ben && ben.verification_status !== 'Verified') {
                    return sendError(res, null, `Account is pending admin verification. Current status: ${ben.verification_status}`, 403);
                }
            }
            sendResponse(res, user, 'Login successful');
        } else {
            sendError(res, null, 'Invalid credentials', 401);
        }
    } catch (err) { sendError(res, err, 'Login error'); }
};
