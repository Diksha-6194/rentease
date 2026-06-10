# RentEase - PostgreSQL Database Design

## Table of Contents
1. [Schema Definitions](#schema-definitions)
    - [users](#1-users)
    - [properties](#2-properties)
    - [property_images](#3-property_images)
    - [bookings](#4-bookings)
    - [payments](#5-payments)
    - [conversations](#6-conversations)
    - [messages](#7-messages)
    - [notifications](#8-notifications)
2. [ER Diagram Explanation](#er-diagram-explanation)
3. [Relationships](#relationships)
4. [Data Flow Explanation](#data-flow-explanation)

---

## Schema Definitions

### 1. `users`
Stores all platform users (Tenants, Landlords, and Admins) and handles role-based access.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `role` | `VARCHAR(20)` | **NOT NULL**, `CHECK(role IN ('tenant', 'landlord', 'admin'))` | User role |
| `name` | `VARCHAR(150)` | **NOT NULL** | Full name |
| `email` | `VARCHAR(255)` | **UNIQUE**, **NOT NULL** | Login email |
| `password_hash` | `VARCHAR(255)` | **NOT NULL** | Hashed password |
| `phone_number` | `VARCHAR(20)` | `NULL` | Contact number |
| `profile_photo` | `VARCHAR(500)` | `NULL` | URL to profile image |
| `is_active` | `BOOLEAN` | Default: `TRUE` | Used by admins to suspend users |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Last updated |

**Indexes:**
- `idx_users_email` ON `users(email)`
- `idx_users_role` ON `users(role)`

---

### 2. `properties`
Stores rental listings created by landlords.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `landlord_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | Landlord owner |
| `title` | `VARCHAR(255)` | **NOT NULL** | Listing title |
| `description` | `TEXT` | **NOT NULL** | Detailed description |
| `property_type` | `VARCHAR(50)` | **NOT NULL** (e.g., Apartment, House) | Type of property |
| `rent_amount` | `DECIMAL(10, 2)`| **NOT NULL**, `CHECK(rent_amount >= 0)` | Monthly rent |
| `deposit_amount`| `DECIMAL(10, 2)`| **NOT NULL**, `CHECK(deposit_amount >= 0)` | Security deposit |
| `address` | `VARCHAR(255)` | **NOT NULL** | Street address |
| `city` | `VARCHAR(100)` | **NOT NULL** | City name |
| `state` | `VARCHAR(100)` | **NOT NULL** | State/Region |
| `country` | `VARCHAR(100)` | **NOT NULL** | Country name |
| `latitude` | `DECIMAL(9, 6)` | `NULL` | For Mapbox integration |
| `longitude` | `DECIMAL(9, 6)` | `NULL` | For Mapbox integration |
| `bedrooms` | `INTEGER` | **NOT NULL**, `CHECK(bedrooms >= 0)` | Number of bedrooms |
| `bathrooms` | `INTEGER` | **NOT NULL**, `CHECK(bathrooms >= 0)` | Number of bathrooms |
| `amenities` | `JSONB` | Default: `'{}'` | JSON array of amenities |
| `status` | `VARCHAR(50)` | `CHECK(status IN ('available', 'unavailable', 'rented'))` | Availability |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Creation date |
| `updated_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Last updated |
| `deleted_at` | `TIMESTAMP` | `NULL` | Soft delete timestamp |

**Indexes:**
- `idx_properties_landlord_id` ON `properties(landlord_id)`
- `idx_properties_city` ON `properties(city)`
- `idx_properties_status` ON `properties(status)`
- `idx_properties_coords` ON `properties(latitude, longitude)`

---

### 3. `property_images`
Handles multiple images associated with a property.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `property_id` | `UUID` | **FOREIGN KEY** (`properties.id`) ON DELETE CASCADE | Associated property |
| `image_url` | `VARCHAR(500)` | **NOT NULL** | URL of uploaded image |
| `is_primary` | `BOOLEAN` | Default: `FALSE` | Featured thumbnail image |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Upload date |

**Indexes:**
- `idx_property_images_property_id` ON `property_images(property_id)`

---

### 4. `bookings`
Manages rental reservations made by tenants.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `property_id` | `UUID` | **FOREIGN KEY** (`properties.id`) ON DELETE CASCADE | Property booked |
| `tenant_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | Tenant booking it |
| `start_date` | `DATE` | **NOT NULL** | Move-in date |
| `end_date` | `DATE` | **NOT NULL** | Move-out date |
| `total_amount` | `DECIMAL(10, 2)`| **NOT NULL** | Total price |
| `status` | `VARCHAR(50)` | `CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed'))` | Booking state |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Request date |
| `updated_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Last updated |

**Indexes:**
- `idx_bookings_property_id` ON `bookings(property_id)`
- `idx_bookings_tenant_id` ON `bookings(tenant_id)`
- `idx_bookings_status` ON `bookings(status)`

---

### 5. `payments`
Tracks transactions via Stripe.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `booking_id` | `UUID` | **FOREIGN KEY** (`bookings.id`) ON DELETE SET NULL | Associated booking |
| `tenant_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE SET NULL | Payer (tenant) |
| `stripe_tx_id`| `VARCHAR(255)` | **UNIQUE**, `NULL` | Stripe Transaction ID |
| `amount` | `DECIMAL(10, 2)`| **NOT NULL** | Paid amount |
| `payment_type`| `VARCHAR(50)` | `CHECK(payment_type IN ('rent', 'booking_fee'))` | Type of payment |
| `status` | `VARCHAR(50)` | `CHECK(status IN ('pending', 'successful', 'failed', 'refunded'))` | Transaction state |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Transaction date |

**Indexes:**
- `idx_payments_booking_id` ON `payments(booking_id)`
- `idx_payments_tenant_id` ON `payments(tenant_id)`
- `idx_payments_stripe_tx_id` ON `payments(stripe_tx_id)`

---

### 6. `conversations`
Parent container for messages between a tenant and a landlord regarding a property.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `tenant_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | Initiating tenant |
| `landlord_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | Receiving landlord |
| `property_id` | `UUID` | **FOREIGN KEY** (`properties.id`) ON DELETE SET NULL | Property in context |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Started date |
| `updated_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Last message time |

**Constraints:** `UNIQUE(tenant_id, landlord_id, property_id)`
**Indexes:**
- `idx_conversations_tenant_id` ON `conversations(tenant_id)`
- `idx_conversations_landlord_id` ON `conversations(landlord_id)`

---

### 7. `messages`
Stores individual chat messages in a conversation.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `conversation_id`| `UUID` | **FOREIGN KEY** (`conversations.id`) ON DELETE CASCADE| Conversation thread |
| `sender_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | User sending message |
| `content` | `TEXT` | **NOT NULL** | Message body |
| `is_read` | `BOOLEAN` | Default: `FALSE` | Read receipt flag |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Sent date |

**Indexes:**
- `idx_messages_conversation_id` ON `messages(conversation_id)`
- `idx_messages_created_at` ON `messages(created_at)`

---

### 8. `notifications`
System alerts pushed via Firebase Cloud Messaging.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PRIMARY KEY**, Default: `uuid_generate_v4()` | Unique identifier |
| `user_id` | `UUID` | **FOREIGN KEY** (`users.id`) ON DELETE CASCADE | Recipient user |
| `title` | `VARCHAR(255)` | **NOT NULL** | Alert title |
| `message` | `TEXT` | **NOT NULL** | Alert body |
| `type` | `VARCHAR(50)` | `CHECK(type IN ('booking', 'payment', 'message', 'system'))`| Notification type |
| `is_read` | `BOOLEAN` | Default: `FALSE` | Read status |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` | Notification date |

**Indexes:**
- `idx_notifications_user_id_read` ON `notifications(user_id, is_read)`

---

## ER Diagram Explanation

1. **Central Entities:** The `users` and `properties` tables are the core of the database. All interactions route through them.
2. **Transactional Hub:** The `bookings` table bridges `users` (as tenants) and `properties`. 
3. **Financial Trail:** The `payments` table heavily relies on `bookings` to dictate how much rent is owed, but is independently tracked via Stripe IDs.
4. **Communication Silo:** `conversations` acts as a bridging table linking a tenant, a landlord, and a specific property, while `messages` stores the chronologically ordered chat texts.

## Relationships

### One-to-Many Relationships (1:N)
* **Landlord (1) → Properties (N):** A single user (Landlord) can list multiple properties.
* **Property (1) → Images (N):** A property has multiple photos inside `property_images`.
* **Property (1) → Bookings (N):** A property can be booked multiple times across different dates.
* **Tenant (1) → Bookings (N):** A single user (Tenant) can have multiple booking histories.
* **Booking (1) → Payments (N):** A single booking can yield multiple payment records (e.g., Security deposit first, then monthly rent).
* **Conversation (1) → Messages (N):** A conversation thread contains numerous messages.
* **User (1) → Notifications (N):** A user can receive an unlimited array of alerts.

### Many-to-Many Relationships (N:M)
* **Tenants (N) ↔ Landlords (M):** Facilitated through the `conversations` table. Multiple tenants can message multiple landlords, resolved via `conversations.tenant_id` and `conversations.landlord_id`.
* **Tenants (N) ↔ Properties (M):** Facilitated through the `bookings` table. A property can host many tenants over time, and a tenant can rent many properties over time.

## Data Flow Explanation

1. **Listing Creation:** Landlord registers in `users`, then inserts a record into `properties`. The upload of photos triggers multiple inserts into `property_images`.
2. **Discovery & Booking:** Tenant registers in `users`, queries `properties` (filtered by city/amount). Tenant selects dates and inserts a row into `bookings` (Status: `pending`).
3. **Communication:** Tenant asks a question. The system creates a `conversations` row linking the tenant, landlord, and property. Follow-up texts insert into `messages`.
4. **Approval & Payment:** Landlord approves the booking (`bookings.status` = `approved`). Tenant initiates checkout, triggering Stripe. Upon success, a webhook hits the backend, inserting a row into `payments` (`status` = `successful`).
5. **Alerting:** Throughout these events (Booking request, approval, payment, chat), records are continually inserted into `notifications` and pushed to clients.
