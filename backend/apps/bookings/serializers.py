from rest_framework import serializers
from .models import Booking
from apps.properties.models import Property
from apps.properties.serializers import PropertySerializer
from django.db.models import Q
from datetime import date

class BookingSerializer(serializers.ModelSerializer):
    property_details = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'property', 'property_details', 'tenant', 'start_date', 
            'end_date', 'total_amount', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'tenant', 'status', 'total_amount', 'created_at', 'updated_at')

    def validate(self, data):
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        property_obj = data.get('property')

        if not self.instance:
            if start_date < date.today():
                raise serializers.ValidationError({"start_date": "Start date cannot be in the past."})
            if end_date <= start_date:
                raise serializers.ValidationError({"end_date": "End date must be after start date."})

            overlapping_bookings = Booking.objects.filter(
                property=property_obj,
                status__in=['pending', 'approved']
            ).filter(
                Q(start_date__lt=end_date) & Q(end_date__gt=start_date)
            )

            if overlapping_bookings.exists():
                raise serializers.ValidationError({"dates": "These dates are not available. Another booking exists."})

        return data
