# SQL Change Guide (Database-First Architecture)

Because this system is built with a Database-First approach, the frontend acts merely as a display and data-passing layer. Most business logic modifications requested by the professor can be executed entirely within Oracle SQL/PLSQL without touching React, HTML, or Node.js.

## 1. How to add a new column to a report
If the professor wants a new column in the "Pending Requests" table (e.g., adding the beneficiary's phone number):
1. Open `03_views.sql`.
2. Modify `vw_pending_help_requests`:
```sql
CREATE OR REPLACE VIEW vw_pending_help_requests AS
SELECT 
    hr.request_id,
    u.full_name AS beneficiary_name,
    u.phone AS beneficiary_phone, -- <--- NEW COLUMN
    b.cnic_passport_no,
    -- ... rest of the query
```
3. Run the SQL. The backend `SELECT * FROM vw_pending_help_requests` automatically fetches the new column, and the generic frontend table will render it (if coded dynamically) or require a simple HTML `<th>` addition. No complex JS logic needed.

## 2. How to change a validation rule
If the professor says "A campaign target amount must be at least $1000":
1. Open `01_create_tables.sql`.
2. Alter the table:
```sql
ALTER TABLE CAMPAIGNS ADD CONSTRAINT chk_target_min CHECK (target_amount >= 1000);
```
3. The frontend needs no changes. Any invalid insert from Node.js will trigger an Oracle error, which the backend generic error handler catches and displays on the UI.

## 3. How to change PL/SQL logic
If the professor says "When a donation is made, automatically add a 5% platform fee to the receipt":
1. Open `05_plsql_package.sql`.
2. Edit `register_donation`:
```sql
    PROCEDURE register_donation(p_donor_id IN NUMBER, p_campaign_id IN NUMBER, p_type IN VARCHAR2, p_amount IN NUMBER, p_receipt_out OUT VARCHAR2) IS
        v_fee NUMBER := p_amount * 0.05;
        v_total NUMBER := p_amount + v_fee;
    BEGIN
        p_receipt_out := generate_receipt_no();
        -- Insert logic using v_total instead of p_amount
```
3. Recompile the package. The frontend form (which just sends `amount: 100`) stays exactly the same, but the database now processes $105.

## 4. How to add a new table
1. Write the `CREATE TABLE` script.
2. Add foreign keys.
3. If it needs to be shown on the frontend, create a View (`CREATE VIEW vw_new_table AS ...`).
4. Update the backend router with a simple `SELECT * FROM vw_new_table`.

## 5. How to keep the frontend unchanged
- **Always read through Views**: Never do `JOIN`s in Node.js or React. If the table structure changes, update the View to match the old output signature, keeping the API response identical.
- **Always write through PL/SQL Procedures**: Never write raw `INSERT` or `UPDATE` logic with multiple dependencies in Node.js. Call `charity_pkg.do_something()`. If the insertion logic changes (e.g., updating 3 tables instead of 1), you only update the PL/SQL body.
