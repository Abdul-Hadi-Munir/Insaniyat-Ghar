# Database Normalization

The database schema is normalized up to the Boyce-Codd Normal Form (BCNF) to eliminate data redundancy, prevent insertion/update/deletion anomalies, and ensure data integrity.

## First Normal Form (1NF)
**Rule**: All columns must contain atomic values, and each record must be unique.
**Implementation**: 
- We do not store comma-separated values. For example, instead of storing multiple skills in a single `VOLUNTEER` column as unstructured text, we can link it out (though currently stored as a string, in a strict implementation, a `VOLUNTEER_SKILLS` table could be added). 
- Every table has a Primary Key (`user_id`, `donation_id`, etc.).

## Second Normal Form (2NF)
**Rule**: Must be in 1NF, and all non-key attributes must be fully functionally dependent on the entire primary key (removes partial dependencies).
**Implementation**:
- In associative entities like `VOLUNTEER_ASSIGNMENTS`, the primary key is `assignment_id` (Surrogate). The attributes `assigned_task` and `task_status` depend entirely on the assignment itself, not just on the `volunteer_id` or `event_id` partially.

## Third Normal Form (3NF)
**Rule**: Must be in 2NF, and there should be no transitive dependencies (non-key attributes depending on other non-key attributes).
**Implementation**:
- Instead of storing `role_name` directly inside the `USERS` table, we moved it to a separate `ROLES` table. `USERS` holds `role_id` as a foreign key. This prevents update anomalies if a role name changes.
- Instead of storing Donor details in the `DONATIONS` table, we store `donor_id` referencing the `DONORS` table, which in turn references `USERS`.

## Boyce-Codd Normal Form (BCNF)
**Rule**: A stricter version of 3NF. For every non-trivial functional dependency X -> Y, X must be a superkey.
**Implementation**:
- All functional dependencies in the database map directly to primary keys or unique constraints (e.g., `email` in `USERS`, `cnic_passport_no` in `BENEFICIARIES`). There are no overlapping candidate keys causing BCNF violations.
