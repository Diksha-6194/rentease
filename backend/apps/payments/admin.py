from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'tenant', 'amount', 'status', 'created_at')
    list_filter = ('status', 'payment_type')
    search_fields = ('stripe_tx_id', 'tenant__email')
