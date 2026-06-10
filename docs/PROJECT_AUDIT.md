# RentEase - Comprehensive Project Audit

This document serves as an exhaustive audit of the entire RentEase project across its frontend, backend, database, and configurations. It highlights bugs, architectural issues, missing implementations, and broken connections.

---

## 1. Missing Features & Pages (Frontend)

### Missing UI Pages
- **Severity**: High
- **Root Cause**: The React routing (`App.jsx`) and `pages` directory do not contain any views for Authentication, Communication, or Payment management.
- **Exact File(s)**: `frontend/src/App.jsx`, `frontend/src/pages/`
- **Proposed Fix**: Create the following pages and map them in React Router:
  - `LoginPage.jsx`
  - `RegisterPage.jsx`
  - `ProfilePage.jsx`
  - `ChatPage.jsx` (For conversations and messaging)
  - `NotificationsPage.jsx`

### Missing Services
- **Severity**: High
- **Root Cause**: API wrapper services were only generated for properties and bookings.
- **Exact File(s)**: `frontend/src/services/`
- **Proposed Fix**: Create:
  - `authService.js` (login, register, logout, profile fetching)
  - `communicationService.js` (fetching messages, sending messages)
  - `paymentService.js` (creating checkout sessions, getting history)

---

## 2. Frontend-Backend Integration Issues

### Inconsistent JWT Storage Keys
- **Severity**: High
- **Root Cause**: `propertyService.js` was modified to fetch the JWT from `localStorage.getItem('token')`, whereas `bookingService.js` relies on `localStorage.getItem('accessToken')`. This inconsistency will cause booking requests to fail with `401 Unauthorized`.
- **Exact File(s)**: 
  - `frontend/src/services/propertyService.js` (Line 8)
  - `frontend/src/services/bookingService.js` (Line 8)
- **Proposed Fix**: Unify the storage key across all Axios interceptors. It is recommended to use `accessToken` globally.

### Missing Global Auth State
- **Severity**: Medium
- **Root Cause**: There is no React Context or Redux store managing the user's authentication state. The UI (navbar) does not dynamically render "Login/Register" vs "Logout" buttons based on auth status.
- **Exact File(s)**: `frontend/src/App.jsx`, `frontend/src/context/AuthContext.jsx` (Missing)
- **Proposed Fix**: Implement an `AuthContext` to provide user role and authentication state application-wide.

---

## 3. Database Issues

### Database Engine Downgrade
- **Severity**: High
- **Root Cause**: The backend configuration was modified to use `sqlite3` instead of the approved `PostgreSQL` architecture. SQLite lacks support for advanced concurrency and specific Django Postgres fields (if used).
- **Exact File(s)**: `backend/rentease_backend/settings.py` (Line 86)
- **Proposed Fix**: Revert `DATABASES['default']['ENGINE']` to `django.db.backends.postgresql` and inject DB credentials via environment variables (`DATABASE_URL`).

---

## 4. Authentication & Authorization Issues

### Incomplete Admin Registration
- **Severity**: Low
- **Root Cause**: Only the `User` model is registered in the Django Admin portal. Properties, Bookings, Payments, and Conversations are hidden from the built-in Admin panel.
- **Exact File(s)**: `backend/apps/*/admin.py`
- **Proposed Fix**: Register `Property`, `Booking`, `Payment`, `Conversation`, and `Message` models in their respective `admin.py` files to enable full back-office administration.

### Dummy Webhook Secret
- **Severity**: Critical (in Production)
- **Root Cause**: A fallback dummy value is used for `STRIPE_WEBHOOK_SECRET` which explicitly bypasses cryptographic signature verification if triggered.
- **Exact File(s)**: `backend/apps/payments/views.py` (Line 82)
- **Proposed Fix**: Strictly enforce `.env` requirements and remove the fallback `if settings.STRIPE_WEBHOOK_SECRET == 'whsec_dummy_secret'` bypass block before deploying to staging/production.

---

## 5. Broken APIs & Routes

### Ineffective Dynamic Import Warning
- **Severity**: Low
- **Root Cause**: `Vite` warns that `bookingService.js` is dynamically imported in `PropertyDetailsPage.jsx` (`await import('../services/bookingService')`) but statically imported elsewhere. This prevents optimal code-splitting.
- **Exact File(s)**: `frontend/src/pages/PropertyDetailsPage.jsx`
- **Proposed Fix**: Change the dynamic import in `handleBookingSubmit` to a standard static import at the top of the file: `import { bookingService } from '../services/bookingService';`.

### CORS Configuration Missing
- **Severity**: Medium
- **Root Cause**: Django CORS headers (`django-cors-headers`) are not explicitly configured to allow requests from the React frontend port (usually `localhost:5173`).
- **Exact File(s)**: `backend/rentease_backend/settings.py`
- **Proposed Fix**: Install `django-cors-headers`, add it to `INSTALLED_APPS` and `MIDDLEWARE`, and configure `CORS_ALLOWED_ORIGINS`.

---

## Conclusion
The backend architecture (Models, Serializers, Views) is robust and nearly feature-complete for the core MVP. However, the **Frontend is severely lagging behind the backend capabilities**. The immediate priority should be building out the missing Authentication UI, unifying API services, and fixing the SQLite database regression.
