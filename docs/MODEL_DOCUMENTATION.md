# RentEase - Django Model Documentation

This document provides an overview of the Django ORM implementation for the RentEase project, strictly adhering to the `DATABASE_DESIGN.md`.

## Architectural Decisions
- **Custom User Model:** Utilized `AbstractBaseUser` to define a role-based (`tenant`, `landlord`, `admin`) `User` model, using `email` as the login credential. Configured in `settings.py` via `AUTH_USER_MODEL`.
- **UUID Primary Keys:** All models use UUID (`uuid.uuid4`) as their primary key for security and distributed scalability.
- **Timestamps:** Every major entity includes `created_at` (`auto_now_add=True`) and `updated_at` (`auto_now=True`) fields.
- **Soft Deletion:** Implemented in the `Property` model. By overriding the default model manager with a custom `SoftDeleteManager`, deleted properties are filtered out by checking if `deleted_at__isnull=True`. Overridden `delete()` and added `restore()`/`hard_delete()`.

---

## Django Apps & Models

### 1. `accounts` App
**Model:** `User`
- **Inherits:** `AbstractBaseUser`, `PermissionsMixin`
- **Fields:** `id`, `role`, `name`, `email`, `phone_number`, `profile_photo`, `is_active`, `is_staff`, `created_at`, `updated_at`.
- **Manager:** Custom `UserManager` to handle `create_user` and `create_superuser`.

### 2. `properties` App
**Model:** `Property`
- **Relationships:** `landlord` (FK to `User`).
- **Fields:** Title, description, `property_type`, `rent_amount`, `deposit_amount`, address details, `latitude`, `longitude`, `bedrooms`, `bathrooms`, `amenities`, `status`.
- **Validation:** Used `MinValueValidator(0)` on numerical constraints (rent, deposit, bedrooms, bathrooms).
- **Soft Delete:** Managed via `deleted_at` field.

**Model:** `PropertyImage`
- **Relationships:** `property` (FK to `Property`).
- **Fields:** `image_url`, `is_primary`, `created_at`.

### 3. `bookings` App
**Model:** `Booking`
- **Relationships:** `property` (FK to `Property`), `tenant` (FK to `User`).
- **Fields:** `start_date`, `end_date`, `total_amount`, `status` (`pending`, `approved`, etc.), `created_at`, `updated_at`.

### 4. `payments` App
**Model:** `Payment`
- **Relationships:** `booking` (FK to `Booking`), `tenant` (FK to `User`). Both use `on_delete=models.SET_NULL` to retain transaction records even if the booking or user is deleted.
- **Fields:** `stripe_tx_id`, `amount`, `payment_type`, `status`, `created_at`.

### 5. `communication` App
**Model:** `Conversation`
- **Relationships:** `tenant` (FK to `User`), `landlord` (FK to `User`), `property` (FK to `Property`).
- **Constraints:** Meta `unique_together` on `('tenant', 'landlord', 'property')` to ensure one continuous thread per rental context.

**Model:** `Message`
- **Relationships:** `conversation` (FK to `Conversation`), `sender` (FK to `User`).
- **Fields:** `content`, `is_read`, `created_at`.

**Model:** `Notification`
- **Relationships:** `user` (FK to `User`).
- **Fields:** `title`, `message`, `type`, `is_read`, `created_at`.

---

## Indexing & Performance
All models include appropriate `Meta.indexes` definitions mirroring the `DATABASE_DESIGN.md` (e.g., indexing `email`, `role`, `status`, `city`, and Foreign Keys).
