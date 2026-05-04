# ERD Description (Entity Relationship Diagram)

## Entities & Attributes
1. **USERS**: user_id (PK), full_name, email, password_hash, phone, address, role_id (FK), status, created_at
2. **ROLES**: role_id (PK), role_name
3. **DONORS**: donor_id (PK), user_id (FK), donor_type, organization_name
4. **BENEFICIARIES**: beneficiary_id (PK), user_id (FK), cnic_passport_no, family_members, income_level, verification_status
5. **CAMPAIGNS**: campaign_id (PK), title, description, target_amount, collected_amount, start_date, end_date, status, created_by (FK)
6. **DONATIONS**: donation_id (PK), donor_id (FK), campaign_id (FK), donation_type, amount, donation_date, payment_status, receipt_no
7. **ITEM_CATEGORIES**: category_id (PK), category_name
8. **ITEM_DONATIONS**: item_donation_id (PK), donation_id (FK), category_id (FK), item_name, quantity, condition_status
9. **INVENTORY**: inventory_id (PK), category_id (FK), item_name, total_quantity, available_quantity, last_updated
10. **HELP_REQUESTS**: request_id (PK), beneficiary_id (FK), campaign_id (FK), request_type, requested_amount, description, request_status, submitted_at, approved_by (FK)
11. **FUND_DISTRIBUTIONS**: distribution_id (PK), request_id (FK), amount_distributed, distribution_date, distributed_by (FK), remarks
12. **INVENTORY_DISTRIBUTIONS**: inv_distribution_id (PK), request_id (FK), inventory_id (FK), quantity_given, distribution_date, distributed_by (FK)
13. **VOLUNTEERS**: volunteer_id (PK), user_id (FK), skills, availability_status
14. **EVENTS**: event_id (PK), campaign_id (FK), event_title, event_date, location, status
15. **VOLUNTEER_ASSIGNMENTS**: assignment_id (PK), volunteer_id (FK), event_id (FK), assigned_task, task_status
16. **PAYMENTS**: payment_id (PK), donation_id (FK), payment_method, transaction_id, payment_date, verified_by (FK)
17. **AUDIT_LOGS**: log_id (PK), user_id (FK), action_type, table_name, record_id, action_time, description
18. **NOTIFICATIONS**: notification_id (PK), user_id (FK), message, notification_type, is_read, created_at

## Relationships & Cardinality
- **ROLES to USERS**: 1-to-Many (One role can belong to many users)
- **USERS to DONORS/BENEFICIARIES/VOLUNTEERS**: 1-to-1 (User subtype)
- **DONORS to DONATIONS**: 1-to-Many (One donor can make many donations)
- **CAMPAIGNS to DONATIONS**: 1-to-Many (One campaign receives many donations)
- **DONATIONS to PAYMENTS**: 1-to-Many (One donation can have multiple payment attempts)
- **DONATIONS to ITEM_DONATIONS**: 1-to-Many
- **BENEFICIARIES to HELP_REQUESTS**: 1-to-Many
- **HELP_REQUESTS to FUND/INVENTORY_DISTRIBUTIONS**: 1-to-Many
- **CAMPAIGNS to EVENTS**: 1-to-Many
- **VOLUNTEERS to VOLUNTEER_ASSIGNMENTS**: 1-to-Many
- **EVENTS to VOLUNTEER_ASSIGNMENTS**: 1-to-Many
