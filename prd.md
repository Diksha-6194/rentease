# Product Requirements Document (PRD)

# RentEase – Your Gateway to Hassle-Free Living

Version: 1.0

Product Owner: Diksha Phogat

Status: Planning

---

# 1. Product Vision

RentEase is a modern rental marketplace that allows landlords to list properties and tenants to discover, book, communicate, and manage rentals through a single platform.

The platform focuses on ease of use, transparency, real-time communication, secure payments, and location-based property discovery.

---

# 2. Objectives

## Business Goals

* Simplify property rental management
* Reduce landlord vacancy periods
* Improve tenant property discovery experience
* Enable secure online rental transactions
* Centralize communication between landlords and tenants

## User Goals

### Landlord

* List rental properties
* Upload property images
* Manage bookings
* Chat with tenants
* Receive payments

### Tenant

* Search properties
* View property locations on map
* Book available properties
* Chat with landlords
* Make secure payments

---

# 3. User Roles

## Tenant

Can:

* Register/Login
* Search properties
* View property details
* Book properties
* Chat with landlords
* Make payments
* Manage profile

## Landlord

Can:

* Register/Login
* Create property listings
* Upload property images
* Manage availability calendar
* Accept or reject bookings
* Chat with tenants
* Track payments

## Admin

Can:

* Manage users
* Manage properties
* Remove fraudulent listings
* Monitor payments
* View platform analytics
* Handle disputes

---

# 4. Functional Requirements

## Authentication Module

### Features

* User Registration
* User Login
* Forgot Password
* Reset Password
* JWT Authentication
* Role-Based Access Control

### Roles

* Tenant
* Landlord
* Admin

---

# 5. Property Management Module

## Landlord Features

### Create Property

Fields:

* Property Title
* Description
* Property Type
* Address
* City
* State
* Country
* Rent Amount
* Deposit Amount
* Number of Bedrooms
* Number of Bathrooms
* Amenities
* Availability Status

### Property Images

* Multiple image upload
* Real-time image preview
* Image delete before submission

### Edit Property

* Update property information
* Update pricing
* Update availability

### Delete Property

* Soft delete

---

# 6. Property Search Module

## Search Filters

* City
* Rent Range
* Bedrooms
* Property Type
* Availability

## Sorting

* Price Low to High
* Price High to Low
* Newest Listings

---

# 7. Property Detail Page

Display:

* Property Images Gallery
* Description
* Amenities
* Location Map
* Landlord Information
* Availability Calendar
* Booking Button

---

# 8. Maps Integration

## Features

* Interactive Map
* Property Location Marker
* Nearby Property Discovery
* Current User Location

Provider:

* Mapbox Preferred
* Google Maps Optional

---

# 9. Booking Management

## Tenant

Can:

* View availability calendar
* Select dates
* Request booking
* Cancel booking

## Landlord

Can:

* Approve booking
* Reject booking
* Mark property unavailable

Booking Status:

* Pending
* Approved
* Rejected
* Cancelled
* Completed

---

# 10. Real-Time Messaging

## Features

* Tenant ↔ Landlord Chat
* Online Status
* Message Timestamps
* Read Receipts

Notifications:

* New Message Alerts

---

# 11. Payment Module

Provider:

* Stripe

Future:

* PayPal

Features:

* Rent Payment
* Booking Payment
* Payment History
* Transaction Records
* Payment Confirmation

Payment Status:

* Pending
* Successful
* Failed
* Refunded

---

# 12. Notification Module

Firebase Cloud Messaging

Notifications:

* New Booking
* Booking Approval
* Booking Rejection
* New Message
* Payment Success
* Payment Failure

---

# 13. User Profile Module

## Tenant Profile

* Name
* Email
* Phone Number
* Profile Photo
* Booking History

## Landlord Profile

* Name
* Email
* Phone Number
* Profile Photo
* Listed Properties

---

# 14. Admin Dashboard

## User Management

* View Users
* Suspend Users
* Delete Users

## Property Management

* View Listings
* Remove Listings

## Analytics

* Total Users
* Total Properties
* Active Bookings
* Revenue Metrics

---

# 15. Non-Functional Requirements

## Performance

* Page Load < 3 seconds
* API Response < 500ms

## Security

* JWT Authentication
* Password Hashing
* Role-Based Authorization
* Secure Payments
* Input Validation

## Scalability

* Support 10,000+ users

---

# 16. MVC Architecture Requirement

The project MUST follow MVC architecture.

## Model Layer

Responsible for:

* Database entities
* Data validation
* Business objects

Examples:

* User
* Property
* Booking
* Payment
* Message
* Notification

## View Layer

Frontend UI

Built using:

* React.js
* Tailwind CSS

Responsibilities:

* User Interface
* Forms
* Dashboards
* Property Listings

## Controller Layer

Backend API Controllers

Responsibilities:

* Request Handling
* Validation
* Authentication
* Business Logic Routing

Examples:

* AuthController
* PropertyController
* BookingController
* PaymentController
* ChatController
* AdminController

---

# 17. Database Design

Tables:

* users
* properties
* property_images
* bookings
* payments
* conversations
* messages
* notifications

Database:

* PostgreSQL

---

# 18. API Requirements

Authentication APIs

* POST /auth/register
* POST /auth/login
* POST /auth/forgot-password

Property APIs

* GET /properties
* GET /properties/:id
* POST /properties
* PUT /properties/:id
* DELETE /properties/:id

Booking APIs

* POST /bookings
* GET /bookings
* PUT /bookings/:id

Payment APIs

* POST /payments/create
* POST /payments/webhook

Chat APIs

* GET /messages
* POST /messages

Admin APIs

* GET /admin/users
* GET /admin/properties

---

# 19. Tech Stack

Frontend

* React.js
* Tailwind CSS

Backend

* Django

Database

* PostgreSQL

Maps

* Mapbox

Payments

* Stripe

Notifications

* Firebase Cloud Messaging

Authentication

* JWT

Deployment

* Vercel (Frontend)
* Render (Backend)
* PostgreSQL Cloud Database

---

# 20. Future Enhancements

* AI Property Recommendations
* AI Chat Assistant
* Property Reviews
* Property Ratings
* Wishlist/Favorites
* Multi-language Support
* Mobile Application
