from rest_framework import serializers
from .models import Payment
from apps.bookings.serializers import BookingSerializer

class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingSerializer(source='booking', read_only=True)

    class Meta:
        model = Payment
        fields = ('id', 'booking', 'booking_details', 'tenant', 'amount', 'payment_type', 'status', 'stripe_tx_id', 'created_at')
        read_only_fields = ('id', 'tenant', 'amount', 'status', 'stripe_tx_id', 'created_at')
