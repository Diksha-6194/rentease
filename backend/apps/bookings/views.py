from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Booking
from .serializers import BookingSerializer
from django.db.models import Q
import decimal

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'landlord':
            return Booking.objects.filter(property__landlord=user).order_by('-created_at')
        elif user.role == 'tenant':
            return Booking.objects.filter(tenant=user).order_by('-created_at')
        return Booking.objects.none()

    def perform_create(self, serializer):
        property_obj = serializer.validated_data['property']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        days = (end_date - start_date).days
        total_amount = (property_obj.rent_amount / decimal.Decimal('30.0')) * decimal.Decimal(days)
        
        serializer.save(tenant=self.request.user, total_amount=total_amount)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        booking = self.get_object()
        user = request.user
        new_status = request.data.get('status')

        if not new_status:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

        if user.role == 'landlord':
            if new_status not in ['approved', 'rejected', 'completed']:
                return Response({"error": "Invalid status for landlord"}, status=status.HTTP_400_BAD_REQUEST)
            
            if new_status == 'approved':
                overlapping = Booking.objects.filter(
                    property=booking.property,
                    status='pending'
                ).filter(
                    Q(start_date__lt=booking.end_date) & Q(end_date__gt=booking.start_date)
                ).exclude(id=booking.id)
                overlapping.update(status='rejected')

        elif user.role == 'tenant':
            if new_status not in ['cancelled', 'paid']:
                return Response({"error": "Tenants can only cancel bookings or mark as paid"}, status=status.HTTP_400_BAD_REQUEST)
            if new_status == 'cancelled' and booking.status not in ['pending', 'approved']:
                return Response({"error": "Cannot cancel this booking"}, status=status.HTTP_400_BAD_REQUEST)
            if new_status == 'paid' and booking.status != 'approved':
                return Response({"error": "Can only pay for approved bookings"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Unauthorized role"}, status=status.HTTP_403_FORBIDDEN)

        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)
