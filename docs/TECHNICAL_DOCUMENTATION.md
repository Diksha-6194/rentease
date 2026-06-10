# RentEase - Technical Documentation

## Architecture Overview
RentEase follows a strict Model-View-Controller (MVC) architecture, decoupled into a Django backend and a React frontend.

### The Backend (Models & Controllers)
- **Framework**: Django & Django REST Framework (DRF)
- **Database**: PostgreSQL
- **Apps Structure**:
  - `accounts`: User roles and JWT Auth.
  - `properties`: Listings, soft delete logic, file uploads.
  - `bookings`: Reservation lifecycle, date conflict resolution, and automated status transition logic.
  - `communication`: Real-time ready chat and notifications.
  - `payments`: Financial tracking and Stripe Checkout integration.
- **Key Technical Decisions**:
  - **Soft Delete**: `Property` model uses a custom `SoftDeleteManager` checking `deleted_at`.
  - **Image Uploads**: Native Django `ImageField` handling `multipart/form-data` parsing inside custom DRF serializers. Multiple images are tied to one property via `PropertyImage`.
  - **Filtering**: Integrated `django-filter` and `SearchFilter` for robust API querying without heavy custom logic.
  - **Booking Conflicts**: Prevented at the serializer validation layer by checking intersecting date ranges against `pending` and `approved` bookings.
  - **Stripe Webhooks**: Payments are finalized via asynchronous Stripe Webhooks mapped to a raw, CSRF-exempt endpoint that verifies cryptographic signatures to prevent tampering.
  - **Pagination**: Global `PageNumberPagination` configured in `settings.py`.

### The Frontend (Views)
- **Framework**: React 19 via Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Key Technical Decisions**:
  - **Services Layer**: Axios is used inside `/services` to centralize API calls and abstract away complex payload logic (e.g. `FormData` formatting for file uploads).
  - **Aesthetics & UI**: Extensive use of `lucide-react` icons and Tailwind for a modern, glassmorphic aesthetic. Hover effects, dynamic transitions, and modern layouts are prioritized.
  - **State Management**: Local state via `useState/useEffect` handles data fetching, paired with loading spinners for better UX.
