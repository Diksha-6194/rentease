from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'tenant', 'start_date', 'end_date', 'status', 'total_amount')
    list_filter = ('status',)
    search_fields = ('property__title', 'tenant__email')
