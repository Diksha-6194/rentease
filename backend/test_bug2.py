import requests
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.bookings.models import Booking

landlord = User.objects.get(email='landlord@test.com')
booking = Booking.objects.filter(property__landlord=landlord, status='pending').first()

if booking:
    print(f"Testing booking {booking.id}")
    
    # Get token
    response = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
        'email': 'landlord@test.com',
        'password': 'password123'
    })
    token = response.json().get('access')
    if not token:
        print("Failed to get token:", response.json())
        exit(1)
        
    # Patch
    res = requests.patch(f'http://127.0.0.1:8000/api/bookings/{booking.id}/update_status/', 
        json={'status': 'approved'}, 
        headers={'Authorization': f'Bearer {token}'}
    )
    print("Status Code:", res.status_code)
    print("Response:", res.text)
else:
    print("No pending bookings found for landlord.")
