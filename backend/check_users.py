import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rentease_backend.settings")
django.setup()

from apps.accounts.models import User
landlords = User.objects.filter(role='landlord')
if landlords.exists():
    print(f"Landlord found: {landlords.first().email}")
else:
    print("No landlord found.")
