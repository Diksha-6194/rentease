from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property
from .serializers import PropertySerializer
import django_filters

class IsLandlordOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.landlord == request.user

class PropertyFilter(django_filters.FilterSet):
    min_rent = django_filters.NumberFilter(field_name="rent_amount", lookup_expr='gte')
    max_rent = django_filters.NumberFilter(field_name="rent_amount", lookup_expr='lte')
    city = django_filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = Property
        fields = ['city', 'property_type', 'bedrooms', 'status']

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().order_by('-created_at')
    serializer_class = PropertySerializer
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'description', 'city', 'address']
    ordering_fields = ['rent_amount', 'created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only landlords can create/edit properties (enforced object level in IsLandlordOrReadOnly)
            permission_classes = [permissions.IsAuthenticated, IsLandlordOrReadOnly]
        else:
            # Anyone can view properties
            permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # Auto set the landlord to the currently logged in user
        serializer.save(landlord=self.request.user)

    def perform_destroy(self, instance):
        # The model's delete() is already overridden for soft delete
        instance.delete()
