# RentEase - Payment Module Documentation

## Overview
The Payment Module handles financial transactions between Tenants and Landlords using **Stripe**. It securely generates Checkout Sessions for approved bookings and relies on asynchronous Webhooks to finalize payment statuses, ensuring data integrity even if the user closes their browser prematurely.

## Workflow & Lifecycle
1. **Initiation**: A Tenant with an `approved` booking sends a request to `/api/payments/create_checkout_session/`.
2. **Session Generation**: The backend validates the booking, calls the Stripe API to generate a hosted checkout page, and creates a local `Payment` record with `status='pending'`. The Stripe Session ID is saved to `stripe_tx_id`.
3. **Checkout**: The frontend redirects the user to the returned Stripe URL. The user enters their card details on Stripe's secure infrastructure.
4. **Webhook Fulfillment**: Upon successful payment, Stripe asynchronously hits the `/api/payments/webhook/` endpoint with a `checkout.session.completed` event.
5. **Finalization**: 
   - The backend cryptographically verifies the webhook signature.
   - It looks up the `Payment` via `stripe_tx_id` and updates the status to `successful`.
   - The system automatically creates a `Notification` for both the Tenant (receipt) and the Landlord (funds received).

## Security Measures
- **No Direct Card Handling**: RentEase never touches raw credit card numbers, relying entirely on Stripe Checkout.
- **Signature Verification**: The Webhook endpoint uses `STRIPE_WEBHOOK_SECRET` to ensure the payload actually originated from Stripe.
- **Immutability**: The Payment model sets critical fields (`amount`, `stripe_tx_id`, `status`) to `read_only` in the DRF Serializer to prevent tampering via API requests.

## Role-Based Access
- **Tenants**: Can only initiate checkouts for bookings they own. Their history endpoint filters to show only their outgoing payments.
- **Landlords**: Cannot initiate payments. Their history endpoint filters to show incoming payments routed to their properties.
