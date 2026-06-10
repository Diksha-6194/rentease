from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Conversation, Message, Notification
from .serializers import ConversationSerializer, MessageSerializer, NotificationSerializer
from .permissions import IsParticipantOfConversation, IsNotificationOwner

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    
    def get_permissions(self):
        return [permissions.IsAuthenticated(), IsParticipantOfConversation()]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(tenant=user) | Q(landlord=user)).order_by('-updated_at')

    def perform_create(self, serializer):
        property_obj = serializer.validated_data.get('property')
        if not property_obj:
            raise serializers.ValidationError({"property": "Property is required to start a conversation."})
            
        if self.request.user.role == 'tenant':
            tenant = self.request.user
            landlord = property_obj.landlord
        elif self.request.user.role == 'landlord':
            raise serializers.ValidationError({"error": "Landlords cannot initiate conversations. Tenants must initiate."})
        else:
            raise serializers.ValidationError({"error": "Invalid role."})

        # Avoid duplicates
        existing = Conversation.objects.filter(tenant=tenant, landlord=landlord, property=property_obj).first()
        if existing:
            serializer.instance = existing
            return

        serializer.save(tenant=tenant, landlord=landlord)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('-created_at')
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = MessageSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get('content')
        if not content:
            return Response({"error": "Content is required"}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        # Update conversation timestamp
        conversation.save()

        # Create Notification for the other party
        recipient = conversation.landlord if request.user == conversation.tenant else conversation.tenant
        Notification.objects.create(
            user=recipient,
            title=f"New Message from {request.user.name}",
            message=content[:100] + ('...' if len(content) > 100 else ''),
            type='message'
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    
    def get_permissions(self):
        return [permissions.IsAuthenticated(), IsNotificationOwner()]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(is_read=False)
        updated_count = notifications.update(is_read=True)
        return Response({"message": f"{updated_count} notifications marked as read."})
