// ==============================================================================
// initDB.js — SQLite Database Initializer for Insaniyat Ghar
// Creates all 18 tables, 9 views, seeds sample data using ACID transactions
// ==============================================================================
const db = require('../db');

function initializeDatabase() {
    console.log('\n🏠 Insaniyat Ghar — Database Initialization (SQLite + ACID)');
    console.log('=============================================================');

    // ── SCHEMA ────────────────────────────────────────────────────────────
    console.log('\n📋 Creating tables...');
    db.exec(`
        -- 1. ROLES
        CREATE TABLE IF NOT EXISTS roles (
            role_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            role_name TEXT UNIQUE NOT NULL
        );

        -- 2. USERS
        CREATE TABLE IF NOT EXISTS users (
            user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name     TEXT NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone         TEXT,
            address       TEXT,
            role_id       INTEGER NOT NULL,
            status        TEXT NOT NULL DEFAULT 'Active'
                          CHECK (status IN ('Active','Inactive','Suspended')),
            created_at    TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (role_id) REFERENCES roles(role_id)
        );

        -- 3. DONORS
        CREATE TABLE IF NOT EXISTS donors (
            donor_id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id           INTEGER NOT NULL,
            donor_type        TEXT DEFAULT 'Individual'
                              CHECK (donor_type IN ('Individual','Corporate')),
            organization_name TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- 4. BENEFICIARIES
        CREATE TABLE IF NOT EXISTS beneficiaries (
            beneficiary_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id             INTEGER NOT NULL,
            cnic_passport_no    TEXT UNIQUE NOT NULL,
            family_members      INTEGER DEFAULT 1 CHECK (family_members > 0),
            income_level        REAL    DEFAULT 0  CHECK (income_level >= 0),
            verification_status TEXT DEFAULT 'Pending'
                                CHECK (verification_status IN ('Pending','Verified','Rejected')),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- 5. CAMPAIGNS
        CREATE TABLE IF NOT EXISTS campaigns (
            campaign_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            title            TEXT NOT NULL,
            description      TEXT,
            target_amount    REAL DEFAULT 0 CHECK (target_amount >= 0),
            collected_amount REAL DEFAULT 0 CHECK (collected_amount >= 0),
            start_date       TEXT NOT NULL,
            end_date         TEXT NOT NULL,
            status           TEXT DEFAULT 'Draft'
                             CHECK (status IN ('Draft','Active','Completed','Cancelled','Rejected')),
            created_by       INTEGER NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users(user_id),
            CHECK (end_date >= start_date)
        );

        -- 6. DONATIONS
        CREATE TABLE IF NOT EXISTS donations (
            donation_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_id       INTEGER NOT NULL,
            campaign_id    INTEGER,
            donation_type  TEXT NOT NULL CHECK (donation_type IN ('Money','Item')),
            amount         REAL CHECK (amount IS NULL OR amount > 0),
            donation_date  TEXT DEFAULT (datetime('now')),
            payment_status TEXT DEFAULT 'Pending'
                           CHECK (payment_status IN ('Pending','Verified','Failed','Refunded')),
            receipt_no     TEXT UNIQUE,
            FOREIGN KEY (donor_id)    REFERENCES donors(donor_id),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
        );

        -- 7. ITEM_CATEGORIES
        CREATE TABLE IF NOT EXISTS item_categories (
            category_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT UNIQUE NOT NULL
        );

        -- 8. ITEM_DONATIONS
        CREATE TABLE IF NOT EXISTS item_donations (
            item_donation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            donation_id      INTEGER NOT NULL,
            category_id      INTEGER NOT NULL,
            item_name        TEXT NOT NULL,
            quantity         INTEGER NOT NULL CHECK (quantity > 0),
            condition_status TEXT DEFAULT 'Good'
                             CHECK (condition_status IN ('New','Good','Fair','Poor')),
            FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
        );

        -- 9. INVENTORY
        CREATE TABLE IF NOT EXISTS inventory (
            inventory_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id        INTEGER NOT NULL,
            item_name          TEXT NOT NULL,
            total_quantity     INTEGER DEFAULT 0 CHECK (total_quantity >= 0),
            available_quantity INTEGER DEFAULT 0 CHECK (available_quantity >= 0),
            last_updated       TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES item_categories(category_id)
        );

        -- 10. HELP_REQUESTS
        CREATE TABLE IF NOT EXISTS help_requests (
            request_id       INTEGER PRIMARY KEY AUTOINCREMENT,
            beneficiary_id   INTEGER NOT NULL,
            campaign_id      INTEGER,
            request_type     TEXT NOT NULL CHECK (request_type IN ('Money','Item')),
            requested_amount REAL CHECK (requested_amount IS NULL OR requested_amount > 0),
            description      TEXT,
            request_status   TEXT DEFAULT 'Pending'
                             CHECK (request_status IN ('Pending','Approved','Rejected','Completed')),
            submitted_at     TEXT DEFAULT (datetime('now')),
            approved_by      INTEGER,
            FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id),
            FOREIGN KEY (campaign_id)    REFERENCES campaigns(campaign_id),
            FOREIGN KEY (approved_by)    REFERENCES users(user_id)
        );

        -- 11. FUND_DISTRIBUTIONS
        CREATE TABLE IF NOT EXISTS fund_distributions (
            distribution_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id        INTEGER NOT NULL,
            amount_distributed REAL NOT NULL CHECK (amount_distributed > 0),
            distribution_date  TEXT DEFAULT (datetime('now')),
            distributed_by    INTEGER NOT NULL,
            remarks           TEXT,
            FOREIGN KEY (request_id)     REFERENCES help_requests(request_id),
            FOREIGN KEY (distributed_by) REFERENCES users(user_id)
        );

        -- 12. INVENTORY_DISTRIBUTIONS
        CREATE TABLE IF NOT EXISTS inventory_distributions (
            inv_distribution_id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id          INTEGER NOT NULL,
            inventory_id        INTEGER NOT NULL,
            quantity_given      INTEGER NOT NULL CHECK (quantity_given > 0),
            distribution_date   TEXT DEFAULT (datetime('now')),
            distributed_by      INTEGER NOT NULL,
            FOREIGN KEY (request_id)     REFERENCES help_requests(request_id),
            FOREIGN KEY (inventory_id)   REFERENCES inventory(inventory_id),
            FOREIGN KEY (distributed_by) REFERENCES users(user_id)
        );

        -- 13. VOLUNTEERS
        CREATE TABLE IF NOT EXISTS volunteers (
            volunteer_id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id             INTEGER NOT NULL,
            skills              TEXT,
            availability_status TEXT DEFAULT 'Available'
                                CHECK (availability_status IN ('Available','Busy','Inactive')),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- 14. EVENTS
        CREATE TABLE IF NOT EXISTS events (
            event_id    INTEGER PRIMARY KEY AUTOINCREMENT,
            campaign_id INTEGER,
            event_title TEXT NOT NULL,
            event_date  TEXT NOT NULL,
            location    TEXT,
            status      TEXT DEFAULT 'Planned'
                        CHECK (status IN ('Planned','Ongoing','Completed','Cancelled')),
            FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
        );

        -- 15. VOLUNTEER_ASSIGNMENTS
        CREATE TABLE IF NOT EXISTS volunteer_assignments (
            assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            volunteer_id  INTEGER NOT NULL,
            event_id      INTEGER NOT NULL,
            assigned_task TEXT NOT NULL,
            task_status   TEXT DEFAULT 'Assigned'
                          CHECK (task_status IN ('Assigned','In Progress','Completed')),
            FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id),
            FOREIGN KEY (event_id)     REFERENCES events(event_id)
        );

        -- 16. PAYMENTS
        CREATE TABLE IF NOT EXISTS payments (
            payment_id     INTEGER PRIMARY KEY AUTOINCREMENT,
            donation_id    INTEGER NOT NULL,
            payment_method TEXT NOT NULL
                           CHECK (payment_method IN ('Credit Card','Bank Transfer','JazzCash','EasyPaisa','Cash')),
            transaction_id TEXT UNIQUE,
            payment_date   TEXT DEFAULT (datetime('now')),
            verified_by    INTEGER,
            FOREIGN KEY (donation_id) REFERENCES donations(donation_id),
            FOREIGN KEY (verified_by) REFERENCES users(user_id)
        );

        -- 17. AUDIT_LOGS (Durability — every committed action is recorded)
        CREATE TABLE IF NOT EXISTS audit_logs (
            log_id      INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER,
            action_type TEXT NOT NULL,
            table_name  TEXT NOT NULL,
            record_id   INTEGER,
            action_time TEXT DEFAULT (datetime('now')),
            description TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
        );

        -- 18. NOTIFICATIONS
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id           INTEGER NOT NULL,
            message           TEXT NOT NULL,
            notification_type TEXT NOT NULL,
            is_read           INTEGER DEFAULT 0,
            created_at        TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
        CREATE INDEX IF NOT EXISTS idx_donations_date     ON donations(donation_date);
        CREATE INDEX IF NOT EXISTS idx_campaigns_status   ON campaigns(status);
        CREATE INDEX IF NOT EXISTS idx_requests_status    ON help_requests(request_status);
        CREATE INDEX IF NOT EXISTS idx_bene_verification  ON beneficiaries(verification_status);
    `);
    console.log('   ✅ 18 tables created with FK constraints + CHECK constraints');

    // ── VIEWS ─────────────────────────────────────────────────────────────
    console.log('\n👁️  Creating views...');
    db.exec(`
        DROP VIEW IF EXISTS vw_donor_donation_summary;
        CREATE VIEW vw_donor_donation_summary AS
        SELECT d.donor_id,
               u.full_name AS donor_name,
               d.donor_type,
               COUNT(dn.donation_id) AS total_donations,
               COALESCE(SUM(CASE WHEN dn.donation_type='Money' AND dn.payment_status='Verified' THEN dn.amount ELSE 0 END),0) AS total_amount_donated,
               MAX(dn.donation_date) AS last_donation_date
        FROM donors d
        JOIN users u ON d.user_id = u.user_id
        LEFT JOIN donations dn ON d.donor_id = dn.donor_id
        GROUP BY d.donor_id, u.full_name, d.donor_type;

        DROP VIEW IF EXISTS vw_campaign_financial_status;
        CREATE VIEW vw_campaign_financial_status AS
        SELECT c.campaign_id, c.title, c.target_amount, c.collected_amount,
               (c.target_amount - c.collected_amount) AS remaining_amount,
               c.status, c.start_date, c.end_date,
               COUNT(d.donation_id) AS donor_count
        FROM campaigns c
        LEFT JOIN donations d ON c.campaign_id = d.campaign_id AND d.payment_status = 'Verified'
        GROUP BY c.campaign_id, c.title, c.target_amount, c.collected_amount, c.status, c.start_date, c.end_date;

        DROP VIEW IF EXISTS vw_pending_help_requests;
        CREATE VIEW vw_pending_help_requests AS
        SELECT hr.request_id, u.full_name AS beneficiary_name, b.cnic_passport_no,
               hr.request_type, hr.requested_amount, hr.description, hr.submitted_at,
               c.title AS campaign_name
        FROM help_requests hr
        JOIN beneficiaries b ON hr.beneficiary_id = b.beneficiary_id
        JOIN users u ON b.user_id = u.user_id
        LEFT JOIN campaigns c ON hr.campaign_id = c.campaign_id
        WHERE hr.request_status = 'Pending';

        DROP VIEW IF EXISTS vw_inventory_status;
        CREATE VIEW vw_inventory_status AS
        SELECT i.inventory_id, ic.category_name, i.item_name,
               i.total_quantity, i.available_quantity, i.last_updated
        FROM inventory i
        JOIN item_categories ic ON i.category_id = ic.category_id;

        DROP VIEW IF EXISTS vw_monthly_donation_report;
        CREATE VIEW vw_monthly_donation_report AS
        SELECT strftime('%Y-%m', donation_date) AS donation_month,
               COUNT(donation_id) AS total_transactions,
               COALESCE(SUM(amount),0) AS total_amount_collected
        FROM donations
        WHERE payment_status = 'Verified' AND donation_type = 'Money'
        GROUP BY strftime('%Y-%m', donation_date)
        ORDER BY donation_month DESC;

        DROP VIEW IF EXISTS vw_audit_activity_report;
        CREATE VIEW vw_audit_activity_report AS
        SELECT al.log_id, u.full_name AS user_name, u.email,
               al.action_type, al.table_name, al.record_id,
               al.action_time, al.description
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        ORDER BY al.action_time DESC;
    `);
    console.log('   ✅ 6 views created');

    // ── SEED DATA (inside ACID transaction — all or nothing) ───────────────
    console.log('\n🌱 Seeding sample data (ACID transaction)...');

    // Check if already seeded
    const existingRoles = db.all('SELECT COUNT(*) as cnt FROM roles');
    if (existingRoles[0].cnt > 0) {
        console.log('   ℹ️  Data already seeded, skipping...');
        return;
    }

    db.transaction(() => {
        // Roles
        const insertRole = db.getDb().prepare('INSERT OR IGNORE INTO roles (role_name) VALUES (?)');
        ['Super Admin','Charity Manager','Donor','Beneficiary','Volunteer','Finance Officer','Inventory Officer']
            .forEach(r => insertRole.run(r));

        // Users
        const insertUser = db.getDb().prepare(
            'INSERT OR IGNORE INTO users (full_name,email,password_hash,phone,address,role_id) VALUES (?,?,?,?,?,?)'
        );
        [
            ['Ali Admin',       'admin@insaniyat.pk',   'hash1','03001234567','Karachi HQ',        1],
            ['Zainab Manager',  'manager@insaniyat.pk', 'hash2','03001234568','Lahore Branch',     2],
            ['Tariq Donor',     'tariq@donor.pk',       'hash3','03001234569','Islamabad',         3],
            ['Fatima Donor',    'fatima@donor.pk',      'hash4','03001234570','Karachi',           3],
            ['Usman Beneficiary','usman@need.pk',       'hash5','03001234571','Peshawar',          4],
            ['Ayesha Beneficiary','ayesha@need.pk',     'hash6','03001234572','Quetta',            4],
            ['Bilal Volunteer', 'bilal@vol.pk',         'hash7','03001234573','Multan',            5],
            ['Sana Finance',    'sana@fin.pk',          'hash8','03001234574','Karachi HQ',        6],
            ['Omar Inventory',  'omar@inv.pk',          'hash9','03001234575','Lahore Warehouse',  7],
        ].forEach(u => insertUser.run(u));

        // Donors
        db.getDb().prepare('INSERT OR IGNORE INTO donors (user_id,donor_type,organization_name) VALUES (?,?,?)').run(3,'Individual',null);
        db.getDb().prepare('INSERT OR IGNORE INTO donors (user_id,donor_type,organization_name) VALUES (?,?,?)').run(4,'Corporate','Pak Tech Solutions');

        // Beneficiaries
        db.getDb().prepare(
            'INSERT OR IGNORE INTO beneficiaries (user_id,cnic_passport_no,family_members,income_level,verification_status) VALUES (?,?,?,?,?)'
        ).run(5,'42101-1111111-1',6,25000,'Verified');
        db.getDb().prepare(
            'INSERT OR IGNORE INTO beneficiaries (user_id,cnic_passport_no,family_members,income_level,verification_status) VALUES (?,?,?,?,?)'
        ).run(6,'42201-2222222-2',4,15000,'Pending');

        // Item Categories
        ['Clothing','Food','Medicine'].forEach(c =>
            db.getDb().prepare('INSERT OR IGNORE INTO item_categories (category_name) VALUES (?)').run(c)
        );

        // Campaigns
        const today = new Date().toISOString().split('T')[0];
        const future = d => { const dt = new Date(); dt.setDate(dt.getDate()+d); return dt.toISOString().split('T')[0]; };
        const past   = d => { const dt = new Date(); dt.setDate(dt.getDate()-d); return dt.toISOString().split('T')[0]; };

        const insertCamp = db.getDb().prepare(
            'INSERT OR IGNORE INTO campaigns (title,description,target_amount,start_date,end_date,status,created_by) VALUES (?,?,?,?,?,?,?)'
        );
        insertCamp.run('Sindh Flood Relief','Emergency food and shelter for flood victims in Interior Sindh',5000000,past(10),future(20),'Active',2);
        insertCamp.run('Ramadan Rashan Drive','Monthly grocery boxes for deserving families',2000000,past(30),past(5),'Completed',2);
        insertCamp.run('Winter Clothing Drive','Warm clothes for families in northern areas',1500000,future(5),future(35),'Draft',2);

        // Inventory
        db.getDb().prepare('INSERT OR IGNORE INTO inventory (category_id,item_name,total_quantity,available_quantity) VALUES (?,?,?,?)').run(1,'Shalwar Kameez Suits',1000,850);
        db.getDb().prepare('INSERT OR IGNORE INTO inventory (category_id,item_name,total_quantity,available_quantity) VALUES (?,?,?,?)').run(2,'Rashan Bags (Flour, Rice, Oil)',500,320);
        db.getDb().prepare('INSERT OR IGNORE INTO inventory (category_id,item_name,total_quantity,available_quantity) VALUES (?,?,?,?)').run(3,'First Aid Kits',200,180);

        // Donations
        const insertDon = db.getDb().prepare(
            'INSERT OR IGNORE INTO donations (donor_id,campaign_id,donation_type,amount,payment_status,receipt_no) VALUES (?,?,?,?,?,?)'
        );
        insertDon.run(1,1,'Money',50000,'Verified','REC-1001');
        insertDon.run(2,2,'Money',150000,'Verified','REC-1002');
        insertDon.run(1,1,'Money',75000,'Pending','REC-1003');
        insertDon.run(2,1,'Money',200000,'Verified','REC-1004');

        // Payments
        const insertPay = db.getDb().prepare(
            'INSERT OR IGNORE INTO payments (donation_id,payment_method,transaction_id,verified_by) VALUES (?,?,?,?)'
        );
        insertPay.run(1,'Credit Card','TXN-001',8);
        insertPay.run(2,'Bank Transfer','TXN-002',8);
        insertPay.run(4,'JazzCash','TXN-003',8);

        // Update campaign collected amounts
        db.getDb().prepare(`
            UPDATE campaigns SET collected_amount = (
                SELECT COALESCE(SUM(d.amount),0) FROM donations d
                WHERE d.campaign_id = campaigns.campaign_id
                  AND d.payment_status = 'Verified' AND d.donation_type = 'Money'
            )
        `).run();

        // Help Requests
        const insertReq = db.getDb().prepare(
            'INSERT OR IGNORE INTO help_requests (beneficiary_id,campaign_id,request_type,requested_amount,description,request_status,approved_by) VALUES (?,?,?,?,?,?,?)'
        );
        insertReq.run(1,1,'Item',null,'Need Rashan bag and blankets for family of 6','Approved',2);
        insertReq.run(2,2,'Money',15000,'Medical emergency funds needed','Pending',null);
        insertReq.run(1,1,'Money',25000,'School fee support for children','Pending',null);

        // Fund Distributions
        db.getDb().prepare(
            'INSERT OR IGNORE INTO fund_distributions (request_id,amount_distributed,distributed_by,remarks) VALUES (?,?,?,?)'
        ).run(1,5000,8,'Rashan distribution completed');

        // Inventory Distributions
        db.getDb().prepare(
            'INSERT OR IGNORE INTO inventory_distributions (request_id,inventory_id,quantity_given,distributed_by) VALUES (?,?,?,?)'
        ).run(1,1,4,9);

        // Volunteers
        db.getDb().prepare(
            'INSERT OR IGNORE INTO volunteers (user_id,skills,availability_status) VALUES (?,?,?)'
        ).run(7,'Logistics, First Aid, Driving','Available');

        // Events
        db.getDb().prepare(
            'INSERT OR IGNORE INTO events (campaign_id,event_title,event_date,location,status) VALUES (?,?,?,?,?)'
        ).run(1,'Rashan Distribution Camp',future(5),'Sukkur City Center','Planned');
        db.getDb().prepare(
            'INSERT OR IGNORE INTO events (campaign_id,event_title,event_date,location,status) VALUES (?,?,?,?,?)'
        ).run(1,'Medical Camp',future(10),'Hyderabad General Hospital','Planned');

        // Volunteer Assignments
        db.getDb().prepare(
            'INSERT OR IGNORE INTO volunteer_assignments (volunteer_id,event_id,assigned_task,task_status) VALUES (?,?,?,?)'
        ).run(1,1,'Distribute Rashan bags to families','Assigned');

        // Notifications
        db.getDb().prepare('INSERT OR IGNORE INTO notifications (user_id,message,notification_type) VALUES (?,?,?)').run(1,'Welcome to Insaniyat Ghar Management System','System');
        db.getDb().prepare('INSERT OR IGNORE INTO notifications (user_id,message,notification_type) VALUES (?,?,?)').run(3,'Your donation of PKR 50,000 has been verified','Donation');

        // Audit Logs
        db.getDb().prepare('INSERT OR IGNORE INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)').run(1,'INSERT','users',1,'System admin account created');
        db.getDb().prepare('INSERT OR IGNORE INTO audit_logs (user_id,action_type,table_name,record_id,description) VALUES (?,?,?,?,?)').run(8,'VERIFICATION','payments',1,'Payment TXN-001 verified');
    });

    console.log('   ✅ Sample data seeded (committed atomically)');
    console.log('\n=============================================================');
    console.log('✅ Database ready!');
    console.log('   ACID: Atomicity, Consistency, Isolation, Durability — ACTIVE');
    console.log(`   File: ${require('path').join(__dirname,'../data/insaniyat_ghar.sqlite')}\n`);
}

module.exports = { initializeDatabase };

if (require.main === module) {
    initializeDatabase();
}
