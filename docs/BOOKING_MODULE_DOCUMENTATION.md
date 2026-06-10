# RentEase - Booking Module Documentation

## Overview
The Booking Module handles the lifecycle of property reservations. It enforces strict date availability validation, automates status transitions, and provides specialized dashboard views based on the user's role (Tenant vs. Landlord).

## Booking Lifecycle & State Machine
A booking transitions through several states defined in `Booking.STATUS_CHOICES`:

1. **Pending**: The default state when a Tenant submits a Booking Request.
2. **Approved**: The Landlord accepts the request.
   - *Auto-Reject Trigger*: Upon approval, the backend automatically scans for other `Pending` bookings on the same property whose dates overlap. It forcefully updates them to `Rejected` to prevent double-booking.
3. **Rejected**: The Landlord declines the request, or it was auto-rejected by the system.
4. **Cancelled**: The Tenant decides to cancel their own `Pending` or `Approved` booking.
5. **Completed**: The Landlord marks the booking as finished after the stay concludes.

## Date Validation Logic
Inside `BookingSerializer.validate()`:
- `start_date` cannot be in the past.
- `end_date` must strictly follow `start_date`.
- **Overlap Check**: Queries existing bookings for the same property where `status IN ('pending', 'approved')` and checks if the date ranges intersect using the logic: `Q(start_date__lt=end_date) & Q(end_date__gt=start_date)`.

## Total Amount Calculation
The system calculates the total rent automatically upon creation. It divides the property's `rent_amount` by 30 to get a daily rate, then multiplies it by the number of days booked.

## Frontend UI Components
- **Booking Request Form**: Embedded directly within `PropertyDetailsPage.jsx`. Prevents submission if the form is in a loading state and uses standard HTML5 Date inputs.
- **TenantBookingsPage**: Renders a table of past and upcoming trips for the Tenant, allowing them to instantly trigger the `cancelled` state if eligible.
- **LandlordBookingsPage**: Renders incoming requests, providing bold CTAs to **Approve** or **Reject** pending requests, and to mark approved ones as **Completed**.
