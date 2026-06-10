# RentEase - Bugs & Known Limitations

## 1. Current Known Issues
- **Image Caching**: When a property image is updated or replaced, the old image might still be cached by the client's browser until a hard refresh is performed.
- **Dummy Stripe Webhook**: The current Stripe Webhook setup contains fallback logic for local development that accepts dummy signatures if the webhook secret is the default string. This must be strictly removed or overridden in production.
- **Table Responsiveness**: Certain data-heavy tables (like the Tenant/Landlord Booking Dashboards) require horizontal scrolling on smaller mobile screens.

## 2. Security Considerations
- **JWT Token Storage**: The frontend currently relies on `localStorage` for JWT storage. This is vulnerable to Cross-Site Scripting (XSS) attacks. For production, shifting to secure `HttpOnly` cookies is highly recommended.
- **Secret Management**: Ensure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and Django's `SECRET_KEY` are pulled securely from environment variables. They must never be checked into version control.
- **File Upload Vulnerabilities**: Image uploads rely on Django's native `ImageField`. A production environment should strictly validate file signatures (MIME types) to prevent malicious script uploads (e.g., executing XSS via crafted SVG files).

## 3. Scalability Limitations
- **Communication Polling**: The current chat and notification architecture relies on REST APIs. High concurrent usage will quickly overwhelm the database due to constant client polling. Migration to WebSockets (Django Channels + Redis) is a hard requirement before scaling.
- **Local Media Storage**: Storing images on the local filesystem (`/media/`) prevents horizontal scaling (adding multiple backend servers). If you load-balance across 3 servers, an image uploaded to Server A won't be visible to users hitting Server B. An external object store (like AWS S3 or Cloudinary) is mandatory.
- **Database Connections**: Development defaults are currently in use. Production needs connection pooling (e.g., PgBouncer) to efficiently handle concurrent database queries.

## 4. Future Improvements
- **WebSockets Integration**: Complete the Django Channels implementation drafted in the Communication Module documentation to enable true real-time chat.
- **Advanced Search**: Implement a dedicated search engine like Elasticsearch, Typesense, or Meilisearch for typo-tolerant, geographically-aware property querying.
- **Reviews and Ratings**: Allow tenants to rate and review properties and landlords after a `completed` booking.
- **Email Notifications**: Integrate SendGrid, Postmark, or AWS SES to send email copies of critical system notifications (like booking confirmations and payment receipts).

## 5. Testing Checklist (Pre-Deployment)
- [ ] Verify End-to-End Registration, Login, and RBAC (Role-Based Access Control) restrictions.
- [ ] Upload multiple high-resolution images for a property and verify they render quickly in the frontend gallery.
- [ ] Submit a booking request, have the landlord approve it, and attempt to book intersecting dates to ensure the validation correctly rejects the second attempt.
- [ ] Execute a Stripe payment using test cards and verify the asynchronous Webhook successfully transitions the local payment record to `successful`.
- [ ] Simulate a Tenant initiating a chat and verify the new message notification appears on the Landlord's dashboard.

## 6. Deployment Risks
- **Static & Media Configuration**: Failing to properly configure `WhiteNoise` (for static assets) and `boto3`/S3 (for media files) before launch will result in a completely broken UI (missing CSS and property images).
- **Environment Variables**: Missing or misconfigured `.env` variables (Database URL, Stripe Keys, CORS allowed origins) are the leading cause of failed production deployments.
- **Soft Delete Bloat**: The `Property` model uses a `SoftDelete` mechanism. Over years of use, this could bloat the database. Implementing a background chron job (e.g., Celery) to hard-delete records older than 3 years is recommended to maintain query performance.
