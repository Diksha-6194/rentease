# RentEase - API Documentation

## Authentication Module

Base URL: `/api/auth/`

### 1. Register
- **URL**: `/register/`
- **Method**: `POST`
- **Description**: Register a new user (Tenant, Landlord, Admin).
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "tenant"
  }
  ```
- **Responses**:
  - `201 Created`: User successfully registered.
  - `400 Bad Request`: Validation errors.

### 2. Login (JWT Obtain Token)
- **URL**: `/login/`
- **Method**: `POST`
- **Description**: Authenticate user and return JWT access and refresh tokens.
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Responses**:
  - `200 OK`: Returns `{"access": "...", "refresh": "..."}`.
  - `401 Unauthorized`: Invalid credentials.

### 3. Refresh Token
- **URL**: `/login/refresh/`
- **Method**: `POST`
- **Description**: Refresh an expired access token.
- **Body**:
  ```json
  {
    "refresh": "refresh_token_string"
  }
  ```
- **Responses**:
  - `200 OK`: Returns `{"access": "..."}`.

### 4. Logout (Token Blacklist)
- **URL**: `/logout/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Blacklist a refresh token, logging the user out.
- **Body**:
  ```json
  {
    "refresh": "refresh_token_string"
  }
  ```
- **Responses**:
  - `205 Reset Content`: Successfully logged out.
  - `400 Bad Request`: Invalid or missing token.

### 5. Forgot Password
- **URL**: `/forgot-password/`
- **Method**: `POST`
- **Description**: Request a password reset link.
- **Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Responses**:
  - `200 OK`: Reset link sent.
  - `404 Not Found`: User not found.

### 6. Reset Password
- **URL**: `/reset-password/`
- **Method**: `POST`
- **Description**: Reset password using email (mocked).
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "new_password": "newsecurepassword123"
  }
  ```
- **Responses**:
  - `200 OK`: Password reset successful.
  - `400 Bad Request`: Validation error.

### 7. User Profile
- **URL**: `/profile/`
- **Method**: `GET`, `PUT`, `PATCH`
- **Headers**: `Authorization: Bearer <access_token>`
- **Description**: Retrieve or update the current user's profile.
- **Responses**:
  - `200 OK`: Returns user details.
  - `401 Unauthorized`: Not authenticated.

---

## Role-Based Permissions
Custom permission classes have been created to secure future endpoints based on JWT authentication:
- `IsTenant`: Grants access only to users with `role == 'tenant'`.
- `IsLandlord`: Grants access only to users with `role == 'landlord'`.
- `IsAdminUserRole`: Grants access only to users with `role == 'admin'`.

---

## Property Module

Base URL: `/api/properties/`

### 1. List / Search Properties
- **URL**: `/`
- **Method**: `GET`
- **Description**: Returns a paginated list of properties. Supports search and filtering.
- **Query Params**:
  - `page`: Page number.
  - `search`: Search across title, description, city, address.
  - `city`: Exact match city.
  - `property_type`: Exact match type.
  - `min_rent`: Minimum rent.
  - `max_rent`: Maximum rent.
  - `bedrooms`: Exact match bedrooms.
- **Responses**:
  - `200 OK`: `{"count": 10, "next": "...", "previous": null, "results": [...]}`

### 2. Get Property Details
- **URL**: `/{id}/`
- **Method**: `GET`
- **Description**: Retrieves detailed information and images for a specific property.
- **Responses**:
  - `200 OK`: Detailed property JSON including nested `images`.
  - `404 Not Found`: Property does not exist.

### 3. Create Property
- **URL**: `/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Description**: Creates a new property. Only available to Landlords.
- **Body (`FormData`)**:
  - `title`, `description`, `property_type`, `rent_amount`, `deposit_amount`, `city`, etc.
  - `uploaded_images`: Multiple file attachments.
- **Responses**:
  - `201 Created`: Property created.
  - `401/403`: Unauthorized or not a landlord.

### 4. Update Property
- **URL**: `/{id}/`
- **Method**: `PUT` / `PATCH`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Description**: Updates a property. Only the landlord who owns the property can update it.
- **Body**: Standard fields + optional `uploaded_images`.

### 5. Delete Property
- **URL**: `/{id}/`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Soft-deletes a property. Only the owner can delete.
- **Responses**:
  - `204 No Content`: Soft deleted successfully.

---

## Booking Module

Base URL: `/api/bookings/`

### 1. List Bookings
- **URL**: `/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns bookings relevant to the user.
  - **Tenant**: Returns their own booking history.
  - **Landlord**: Returns bookings made against their properties.
- **Responses**:
  - `200 OK`: `[ { "id": "...", "property": "...", "start_date": "...", "status": "pending", ... } ]`

### 2. Create Booking (Request)
- **URL**: `/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Submits a booking request. Only available to Tenants. Validates date availability.
- **Body**:
  ```json
  {
    "property": "<property_uuid>",
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD"
  }
  ```
- **Responses**:
  - `201 Created`: Booking requested successfully.
  - `400 Bad Request`: Dates are in the past, invalid, or overlapping with existing bookings.

### 3. Update Booking Status
- **URL**: `/{id}/update_status/`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Modifies the booking state.
  - **Landlords** can send `status`: `"approved"`, `"rejected"`, or `"completed"`.
  - **Tenants** can send `status`: `"cancelled"`.
  - When a booking is `approved`, any overlapping `pending` bookings for the same property are automatically marked as `rejected`.
- **Body**:
  ```json
  {
    "status": "approved"
  }
  ```
- **Responses**:
  - `200 OK`: Status updated successfully.
  - `400/403`: Invalid transition or unauthorized role.

---

## Communication Module

Base URL: `/api/communication/`

### 1. Conversations
- **URL**: `/conversations/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns all conversations where the user is either the tenant or the landlord. Includes the latest message.

- **URL**: `/conversations/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Initiates a conversation (Tenants only).
- **Body**: `{"property": "<property_uuid>"}`

### 2. Conversation Messages
- **URL**: `/conversations/{id}/messages/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns paginated messages for a conversation.

- **URL**: `/conversations/{id}/send_message/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Sends a message in the conversation and auto-generates a Notification for the recipient.
- **Body**: `{"content": "Hello!"}`

### 3. Notifications
- **URL**: `/notifications/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Lists all notifications for the user.

- **URL**: `/notifications/{id}/mark_read/`
- **Method**: `PATCH`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Marks a specific notification as read.

- **URL**: `/notifications/mark_all_read/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Marks all unread notifications for the user as read.

---

## Payment Module

Base URL: `/api/payments/`

### 1. Payment History
- **URL**: `/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Returns the payment history.
  - **Tenant**: Returns payments made by the tenant.
  - **Landlord**: Returns payments received for the landlord's properties.
- **Responses**:
  - `200 OK`: `[ { "id": "...", "amount": "...", "status": "successful", ... } ]`

### 2. Create Checkout Session
- **URL**: `/create_checkout_session/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Generates a Stripe Checkout URL for an approved booking. Creates a local `pending` payment record. Only available to Tenants.
- **Body**:
  ```json
  {
    "booking_id": "<uuid>"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "checkout_url": "https://checkout.stripe.com/pay/cs_test_..." }`
  - `400/404`: Booking not found, not approved, or already paid.

### 3. Stripe Webhook (Internal)
- **URL**: `/webhook/`
- **Method**: `POST`
- **Description**: Raw endpoint for Stripe to send asynchronous events (e.g., `checkout.session.completed`). Exempt from JWT auth. Verifies Stripe signatures. Updates payment status to `successful` and triggers Notifications.
