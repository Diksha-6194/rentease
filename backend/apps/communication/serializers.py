from rest_framework import serializers
from .models import Conversation, Message, Notification
from apps.accounts.serializers import UserSerializer
from apps.properties.serializers import PropertySerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_details = UserSerializer(source='sender', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'sender_details', 'content', 'is_read', 'created_at')
        read_only_fields = ('id', 'sender', 'is_read', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    tenant_details = UserSerializer(source='tenant', read_only=True)
    landlord_details = UserSerializer(source='landlord', read_only=True)
    property_details = PropertySerializer(source='property', read_only=True)
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = (
            'id', 'tenant', 'tenant_details', 'landlord', 'landlord_details', 
            'property', 'property_details', 'latest_message', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_latest_message(self, obj):
        latest = obj.messages.order_by('-created_at').first()
        if latest:
            return MessageSerializer(latest).data
        return None

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'type', 'is_read', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')
