import os
import django
import urllib.request
import random
import uuid

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.properties.models import Property, PropertyImage
from apps.bookings.models import Booking
from apps.communication.models import Conversation, Message, Notification
from apps.payments.models import Payment
from django.utils import timezone
from datetime import timedelta

# Ensure users
landlord, _ = User.objects.get_or_create(email='landlord@test.com', defaults={'role': 'landlord', 'name': 'John Landlord'})

# Create 3 demo tenants
tenant1, _ = User.objects.get_or_create(email='tenant@test.com', defaults={'role': 'tenant', 'name': 'Jane Tenant'})
tenant2, _ = User.objects.get_or_create(email='alice@test.com', defaults={'role': 'tenant', 'name': 'Alice Smith'})
tenant3, _ = User.objects.get_or_create(email='bob@test.com', defaults={'role': 'tenant', 'name': 'Bob Johnson'})
tenants = [tenant1, tenant2, tenant3]

media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media', 'properties')
os.makedirs(media_dir, exist_ok=True)

image_urls = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687931-cebf0746e50e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
]

properties_data = [
    {"title": "Oceanview Villa", "city": "Mumbai", "rent": 85000, "beds": 4, "type": "house", "lat": 19.0760, "lng": 72.8777},
    {"title": "Penthouse Suite", "city": "Delhi", "rent": 120000, "beds": 3, "type": "apartment", "lat": 28.6139, "lng": 77.2090},
    {"title": "Cozy Studio", "city": "Bangalore", "rent": 22000, "beds": 1, "type": "studio", "lat": 12.9716, "lng": 77.5946},
    {"title": "Tech Park Condo", "city": "Pune", "rent": 35000, "beds": 2, "type": "condo", "lat": 18.5204, "lng": 73.8567},
    {"title": "Suburban Family Home", "city": "Gurgaon", "rent": 55000, "beds": 3, "type": "house", "lat": 28.4595, "lng": 77.0266},
    {"title": "Downtown Apartment", "city": "Mumbai", "rent": 65000, "beds": 2, "type": "apartment", "lat": 19.0822, "lng": 72.8812},
    {"title": "Lakefront Retreat", "city": "Udaipur", "rent": 45000, "beds": 3, "type": "house", "lat": 24.5854, "lng": 73.7125},
    {"title": "Modern Loft", "city": "Hyderabad", "rent": 40000, "beds": 1, "type": "apartment", "lat": 17.3850, "lng": 78.4867},
    {"title": "Luxury Condominium", "city": "Chennai", "rent": 50000, "beds": 3, "type": "condo", "lat": 13.0827, "lng": 80.2707},
    {"title": "Seaview Studio", "city": "Goa", "rent": 25000, "beds": 1, "type": "studio", "lat": 15.2993, "lng": 74.1240},
]

Property.all_objects.all().delete()
Conversation.objects.all().delete()
Booking.objects.all().delete()
Notification.objects.all().delete()
Payment.objects.all().delete()

opener = urllib.request.build_opener()
opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
urllib.request.install_opener(opener)

created_properties = []

for i, p_data in enumerate(properties_data):
    img_name = f"demo_prop_{i}.jpg"
    img_path = os.path.join(media_dir, img_name)
    try:
        if not os.path.exists(img_path):
            urllib.request.urlretrieve(image_urls[i], img_path)
    except Exception as e:
        print(f"Failed to download image {i}: {e}")
        os.system(f"convert -size 800x600 xc:lightblue {img_path}")

    prop = Property.objects.create(
        landlord=landlord,
        title=p_data["title"],
        description=f"A beautiful {p_data['type']} located in the heart of {p_data['city']}. Fully furnished and ready to move in. Features amazing views and modern amenities.",
        address=f"123 {p_data['city']} Main St",
        city=p_data["city"],
        state="State",
        country="India",
        rent_amount=p_data["rent"],
        deposit_amount=p_data["rent"] * 2,
        bedrooms=p_data["beds"],
        bathrooms=max(1, p_data["beds"] - 1),
        property_type=p_data["type"],
        status="available" if i % 4 != 0 else "rented",
        latitude=p_data["lat"],
        longitude=p_data["lng"],
        amenities={"wifi": True, "ac": True, "gym": True, "pool": i % 2 == 0}
    )
    
    PropertyImage.objects.create(property=prop, image_url=f"properties/{img_name}", is_primary=True)
    created_properties.append(prop)

# Create diverse bookings for tenants
booking_states = ['pending', 'approved', 'paid', 'rejected', 'cancelled']
for i, prop in enumerate(created_properties[:6]):
    t = tenants[i % len(tenants)]
    status = booking_states[i % len(booking_states)]
    
    b = Booking.objects.create(
        property=prop,
        tenant=t,
        start_date=timezone.now().date() + timedelta(days=10 + i),
        end_date=timezone.now().date() + timedelta(days=40 + i),
        status=status,
        total_amount=prop.rent_amount
    )
    
    if status == 'pending':
        Notification.objects.create(user=landlord, title="New Booking Request", message=f"New booking request from {t.name} for {prop.title}", is_read=False)
    elif status == 'approved':
        Notification.objects.create(user=t, title="Booking Approved", message=f"Your booking for {prop.title} was approved. Please proceed to payment.", is_read=False)
    elif status == 'paid':
        Payment.objects.create(
            booking=b,
            tenant=t,
            stripe_tx_id=f"mock_tx_{uuid.uuid4().hex[:8]}",
            amount=prop.rent_amount,
            payment_type='rent',
            status='successful'
        )
        Notification.objects.create(user=t, title="Payment Successful", message=f"Your payment of ${prop.rent_amount} for {prop.title} was successful.", is_read=False)
        Notification.objects.create(user=landlord, title="Rent Received", message=f"{t.name} has paid rent for {prop.title}.", is_read=False)
    elif status == 'rejected':
        Notification.objects.create(user=t, title="Booking Rejected", message=f"Sorry, your booking for {prop.title} was rejected.", is_read=False)

# Create a conversation
conv = Conversation.objects.create(property=created_properties[0], tenant=tenant1, landlord=landlord)
Message.objects.create(conversation=conv, sender=tenant1, content="Hi, is this property still available?")
Message.objects.create(conversation=conv, sender=landlord, content="Yes, it is! When would you like to visit?")
Message.objects.create(conversation=conv, sender=tenant1, content="Can we schedule a tour for this weekend?")
Notification.objects.create(user=tenant1, title="New Message", message="You have a new message from the landlord.", is_read=False)

print("Demo data seeded successfully!")
