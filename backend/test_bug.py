import os
import django
from rest_framework.test import APIClient

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.bookings.models import Booking

landlord = User.objects.get(email='landlord@test.com')
booking = Booking.objects.filter(property__landlord=landlord, status='pending').first()

if booking:
    print(f"Testing booking {booking.id}")
    client = APIClient()
    client.force_authenticate(user=landlord)
    try:
        response = client.patch(f'/api/bookings/{booking.id}/update_status/', {'status': 'approved'}, format='json')
        print("Status Code:", response.status_code)
        if response.status_code != 200:
            print("Response:", response.data if hasattr(response, 'data') else response.content)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("No pending bookings found for landlord.")
