# RentEase Presentation & Demo Guide

Welcome to the **RentEase Demo Environment**! The application is fully populated with test data, stunning visuals, and interactive workflows to guarantee a flawless presentation.

## User Personas & Credentials

The system is pre-seeded with two active accounts you can use to demonstrate both sides of the marketplace.

**1. The Landlord (Host)**
- **Email:** `landlord@test.com`
- **Password:** `password123`
- **Use case:** Demonstrating property management, analytics, and booking approvals.

**2. The Tenant (Renter)**
- **Email:** `tenant@test.com`
- **Password:** `password123`
- **Use case:** Demonstrating the search experience, wishlist saving, chatting, and booking requests.

---

## Recommended Demo Script

Follow this narrative flow to highlight the platform's best features:

### Act 1: The Renter's Journey
1. **The Homepage (Not Logged In)**
   - Open `http://127.0.0.1:5173/`
   - Highlight the professional hero section, the trust statistics, and the featured properties grid.
2. **The Search Experience**
   - Click **Start Searching** or use the Hero search bar.
   - On the `/search` page, click the **Filters** button. Demonstrate adjusting the price range and selecting a property type (e.g., "Apartment").
   - Change the **Sort By** dropdown to "Highest Price".
3. **Property Exploration & Wishlist**
   - Click the heart icon on a few properties to save them to the wishlist.
   - Click on the "Penthouse Suite" to open its Details Page.
   - Highlight the **Highlights**, **Amenities**, and **Similar Properties** sections.
4. **Booking & Communication (As Tenant)**
   - Click **Log In** and sign in as `tenant@test.com`.
   - On the Property Details page, select Check-in and Check-out dates and hit **Request to Book**.
   - Navigate to **Messages**, open the chat with the landlord, and send a new message: *"Looking forward to moving in!"*
   - Navigate to **Wishlist** to show the properties you saved earlier.

### Act 2: The Landlord's Command Center
1. **Logging In**
   - Log out of the tenant account and log in as `landlord@test.com`.
2. **Analytics Dashboard**
   - The first screen is the **My Properties** Dashboard (`/dashboard`).
   - Highlight the KPI cards: Est. Revenue, Total Properties, Active Tenants.
   - Scroll down to show the dynamic **Revenue Growth** line chart and the **Occupancy Rate** pie chart.
   - Show how hover effects display tooltip data on the charts.
3. **Managing Bookings & Alerts**
   - Note the red notification badge on the **Alerts** tab in the navigation bar. Click it to show the new booking request alert.
   - Navigate to **Requests** to view the pending booking from Jane Tenant.
4. **Replying to Tenants**
   - Navigate to **Messages**. The chat UI will look like a modern messaging app.
   - Reply to the tenant: *"Your booking request has been received!"*

---

## Important Presentation Tips
- **Hard Refresh:** Before starting the demo, perform a hard refresh (`Cmd + Shift + R`) to ensure all CSS and new React components are fully loaded.
- **Responsive Design:** You can optionally resize your browser window to simulate a mobile device. The entire UI (including the complex property details grid) will gracefully collapse into a mobile-friendly view.
- **Images:** All placeholder property images are high-resolution architectural photos fetched from Unsplash to ensure the demo looks premium.
