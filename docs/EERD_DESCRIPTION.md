# Enhanced Entity Relationship Diagram (EERD) Description

## Specialization / Generalization
The EERD introduces the concept of subclasses inheriting from a superclass to reduce redundancy.

**Superclass:** `USERS`
- Contains common attributes for all individuals interacting with the system (user_id, full_name, email, password, phone, address).

**Subclasses:**
1. **`DONORS`**: Inherits `user_id`. Adds `donor_type` (Individual, Corporate), `organization_name`.
2. **`BENEFICIARIES`**: Inherits `user_id`. Adds `cnic_passport_no`, `family_members`, `income_level`, `verification_status`.
3. **`VOLUNTEERS`**: Inherits `user_id`. Adds `skills`, `availability_status`.

**Constraint:** 
- Overlapping / Disjoint: In this system, overlapping specialization is allowed. A `USER` can be both a `DONOR` and a `VOLUNTEER`.

## Aggregation
Aggregation is used where a relationship itself acts as an entity.
- **Donation Processing Aggregation**: `DONATION` is an aggregation of `DONOR` and `CAMPAIGN`. The `PAYMENT` entity relates to the `DONATION` as a whole, rather than the `DONOR` alone.
- **Event Assignment Aggregation**: `VOLUNTEER_ASSIGNMENTS` aggregates the relationship between `VOLUNTEERS` and `EVENTS`.

By structuring the EERD this way, the database logically models the real-world charity management ecosystem efficiently.
