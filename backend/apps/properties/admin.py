from django.contrib import admin
from .models import Property, PropertyImage

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'rent_amount', 'landlord', 'status', 'created_at')
    list_filter = ('status', 'city', 'property_type')
    search_fields = ('title', 'city', 'address')
    inlines = [PropertyImageInline]

admin.site.register(PropertyImage)
