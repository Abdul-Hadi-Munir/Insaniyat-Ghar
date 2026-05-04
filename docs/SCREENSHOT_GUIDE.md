# Screenshot Guide for Submission

To finalize your project submission, capture the following screenshots and place them in your final report document:

1. **Table Creation**: Screenshot of SQL Developer / SQL*Plus showing `Table created.` successfully for `USERS`, `DONATIONS`, etc.
2. **Constraints Validation**: Screenshot of an attempt to insert a negative donation amount, showing the Oracle constraint violation error.
3. **Data Insertion**: Screenshot of `SELECT * FROM campaigns;` showing the mock data loaded.
4. **DCL Commands**: Screenshot of `GRANT SELECT ON views TO donor_role;` executed successfully.
5. **Join Queries**: Screenshot of the output of the INNER JOIN or FULL OUTER JOIN from `04_advanced_queries.sql`.
6. **View Output**: Screenshot of `SELECT * FROM vw_campaign_financial_status;` showing calculated remaining amounts.
7. **Trigger Execution**: 
   - Screenshot 1: Campaign collected amount before donation.
   - Screenshot 2: Inserting a donation.
   - Screenshot 3: Campaign collected amount auto-updated by `trg_update_campaign_collected`.
8. **PL/SQL Package**: Screenshot of executing `EXEC charity_pkg.distribute_funds(...)` and the resulting `DBMS_OUTPUT`.
9. **Frontend Interface**:
   - The Login screen.
   - The Dashboard showing Campaigns.
   - The pending requests tab with the "Approve" button.
10. **Reports**: Screenshot of the JSON response from the API or the frontend table showing the `vw_monthly_donation_report` data.
