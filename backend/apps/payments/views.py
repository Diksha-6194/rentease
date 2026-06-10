import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .models import Payment
from .serializers import PaymentSerializer
from apps.bookings.models import Booking
from apps.communication.models import Notification

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'tenant':
            return Payment.objects.filter(tenant=user).order_by('-created_at')
        elif user.role == 'landlord':
            return Payment.objects.filter(booking__property__landlord=user).order_by('-created_at')
        return Payment.objects.none()

    @action(detail=False, methods=['post'])
    def create_checkout_session(self, request):
        if request.user.role != 'tenant':
            return Response({"error": "Only tenants can make payments."}, status=status.HTTP_403_FORBIDDEN)

        booking_id = request.data.get('booking_id')
        if not booking_id:
            return Response({"error": "booking_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.get(id=booking_id, tenant=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found or you do not have permission."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'approved':
            return Response({"error": "Can only pay for approved bookings."}, status=status.HTTP_400_BAD_REQUEST)

        if Payment.objects.filter(booking=booking, status='successful').exists():
            return Response({"error": "Booking is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': f"Rent for {booking.property.title}",
                            },
                            'unit_amount': int(booking.total_amount * 100),
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=request.build_absolute_uri('/my-bookings?payment=success'),
                cancel_url=request.build_absolute_uri('/my-bookings?payment=cancelled'),
            )
            
            Payment.objects.create(
                booking=booking,
                tenant=request.user,
                amount=booking.total_amount,
                payment_type='rent',
                status='pending',
                stripe_tx_id=checkout_session.id
            )

            return Response({'checkout_url': checkout_session.url})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError as e:
        if settings.STRIPE_WEBHOOK_SECRET == 'whsec_dummy_secret':
            event = {"type": "checkout.session.completed", "data": {"object": {"id": "dummy"}}}
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        stripe_tx_id = session.get('id')
        try:
            payment = Payment.objects.get(stripe_tx_id=stripe_tx_id)
            payment.status = 'successful'
            payment.save()

            Notification.objects.create(
                user=payment.tenant,
                title="Payment Successful",
                message=f"Your payment of ${payment.amount} for {payment.booking.property.title} was successful.",
                type='payment'
            )

            Notification.objects.create(
                user=payment.booking.property.landlord,
                title="Payment Received",
                message=f"You received a payment of ${payment.amount} for {payment.booking.property.title}.",
                type='payment'
            )
        except Payment.DoesNotExist:
            pass 
            
    return Response(status=status.HTTP_200_OK)
