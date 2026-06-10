import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
from apps.properties.models import Property, PropertyImage

landlord = User.objects.filter(role='landlord').first()

if not landlord:
    print("No landlord found!")
    exit(1)

# Clean up existing properties for this landlord just in case we have duplicates
Property.all_objects.filter(landlord=landlord).delete()

# Property 1
p1 = Property.objects.create(
    landlord=landlord,
    title="Luxury Apartment Delhi",
    description="A beautiful luxury apartment exterior in Delhi with modern architecture, large windows, and a sunset in the background.",
    address="101 Vasant Vihar",
    city="Delhi",
    state="Delhi",
    country="India",
    rent_amount=25000,
    deposit_amount=50000,
    bedrooms=2,
    bathrooms=2,
    property_type="apartment",
    status="available"
)
PropertyImage.objects.create(property=p1, image_url="properties/luxury_apartment.png", is_primary=True)

# Property 2
p2 = Property.objects.create(
    landlord=landlord,
    title="Modern Studio Noida",
    description="A highly aesthetic modern studio apartment exterior in Noida with glass walls and minimalist design.",
    address="Sector 15",
    city="Noida",
    state="UP",
    country="India",
    rent_amount=18000,
    deposit_amount=36000,
    bedrooms=1,
    bathrooms=1,
    property_type="apartment",
    status="available"
)
PropertyImage.objects.create(property=p2, image_url="properties/modern_studio.png", is_primary=True)

# Property 3
p3 = Property.objects.create(
    landlord=landlord,
    title="Family House Gurgaon",
    description="A beautiful standalone modern family house in Gurgaon with a small garden and warm lighting.",
    address="DLF Phase 3",
    city="Gurgaon",
    state="Haryana",
    country="India",
    rent_amount=35000,
    deposit_amount=70000,
    bedrooms=3,
    bathrooms=3,
    property_type="house",
    status="available"
)
PropertyImage.objects.create(property=p3, image_url="properties/family_house.png", is_primary=True)

print(f"Created {Property.objects.count()} properties with images.")
