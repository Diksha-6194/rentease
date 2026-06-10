# RentEase - Communication Module Documentation

## Overview
The Communication Module provides the backend structure for in-app messaging between Tenants and Landlords, as well as a centralized Notification system. Currently implemented via RESTful APIs, this document also serves as the architectural blueprint for upgrading to a true Real-Time WebSocket infrastructure.

## Current REST API Architecture
- **Conversations**: Tied uniquely to a `Tenant`, `Landlord`, and `Property`. Only Tenants can initiate conversations.
- **Messages**: Attached to a conversation. Sending a message via `POST /conversations/{id}/send_message/` automatically fires a backend trigger that creates a `Notification` for the recipient.
- **Notifications**: Polled by the client. Supports granular `mark_read` or bulk `mark_all_read` operations.

---

## Real-Time Architecture Blueprint (Future Implementation)

To transition from REST polling to a live chat experience, RentEase will adopt **Django Channels** and **Redis**.

### 1. Technology Stack
- **Backend**: `channels`, `channels-redis`
- **Message Broker**: Redis (used as the Channel Layer)
- **Frontend**: Standard WebSocket API or a wrapper like `react-use-websocket`

### 2. WebSocket Routing
Instead of hitting HTTP endpoints, clients will establish persistent connections:
```python
# backend/rentease_backend/routing.py
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<conversation_id>[0-9a-f-]+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]
```

### 3. ChatConsumer Logic
When a user connects to `ws/chat/{id}/`:
1. **Connect**: The consumer checks the JWT token (passed via query params or subprotocols) to ensure the user is a participant (`IsParticipantOfConversation`). 
2. **Join Group**: The consumer adds the WebSocket channel to a Redis group named `chat_{conversation_id}`.
3. **Receive**: When a user sends a message payload, the consumer:
   - Saves the `Message` to the PostgreSQL database.
   - Broadcasts the message to the `chat_{conversation_id}` group.
   - Automatically triggers a notification payload to the `user_{recipient_id}` group.

### 4. NotificationConsumer Logic
When a user connects to `ws/notifications/`:
1. **Connect**: Authenticates the user via JWT.
2. **Join Group**: Adds the user to a Redis group named `user_{user_id}`.
3. **Broadcast**: Whenever any part of the system (Bookings, Payments, Chat) creates a `Notification` in the DB, it will also push an async event to the `user_{user_id}` group, immediately alerting the frontend without needing a page refresh.

### 5. Frontend Integration
The React frontend will mount the WebSocket connections inside a global `CommunicationContext`. When a message arrives over the socket, React state is updated instantly, bypassing the need for continuous Axios polling.
