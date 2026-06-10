import os
import django
from django.utils import timezone
from datetime import timedelta
import uuid

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.properties.models import Property
from apps.bookings.models import Booking
from apps.communication.models import Notification
from apps.payments.models import Payment

def seed_missing_tenant_data():
    landlord = User.objects.filter(role='landlord').first()
    if not landlord:
        print("No landlord found.")
        return

    properties = list(Property.objects.all())
    if not properties:
        print("No properties found.")
        return

    tenants = User.objects.filter(role='tenant')
    booking_states = ['pending', 'approved', 'paid', 'rejected']
    
    count = 0
    for tenant in tenants:
        if Booking.objects.filter(tenant=tenant).exists():
            continue
            
        print(f"Seeding data for tenant: {tenant.email}")
        
        # Create 4 bookings for each new tenant
        for i in range(4):
            prop = properties[i % len(properties)]
            status = booking_states[i % len(booking_states)]
            
            b = Booking.objects.create(
                property=prop,
                tenant=tenant,
                start_date=timezone.now().date() + timedelta(days=10 + i),
                end_date=timezone.now().date() + timedelta(days=40 + i),
                status=status,
                total_amount=prop.rent_amount
            )
            
            if status == 'pending':
                Notification.objects.create(user=landlord, title="New Booking Request", message=f"New booking request from {tenant.name} for {prop.title}", is_read=False)
            elif status == 'approved':
                Notification.objects.create(user=tenant, title="Booking Approved", message=f"Your booking for {prop.title} was approved. Please proceed to payment.", is_read=False)
            elif status == 'paid':
                Payment.objects.create(
                    booking=b,
                    tenant=tenant,
                    stripe_tx_id=f"mock_tx_{uuid.uuid4().hex[:8]}",
                    amount=prop.rent_amount,
                    payment_type='rent',
                    status='successful'
                )
                Notification.objects.create(user=tenant, title="Payment Successful", message=f"Your payment of ${prop.rent_amount} for {prop.title} was successful.", is_read=False)
                Notification.objects.create(user=landlord, title="Rent Received", message=f"{tenant.name} has paid rent for {prop.title}.", is_read=False)
            elif status == 'rejected':
                Notification.objects.create(user=tenant, title="Booking Rejected", message=f"Sorry, your booking for {prop.title} was rejected.", is_read=False)
                
        count += 1

    print(f"Finished seeding data for {count} tenants.")

if __name__ == '__main__':
    seed_missing_tenant_data()
