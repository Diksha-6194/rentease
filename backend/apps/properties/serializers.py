from rest_framework import serializers
from .models import Property, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image_url', 'is_primary', 'created_at')
        read_only_fields = ('id', 'created_at')

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    
    # We allow uploading multiple images via a list of files
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )

    class Meta:
        model = Property
        fields = (
            'id', 'landlord', 'title', 'description', 'property_type', 
            'rent_amount', 'deposit_amount', 'address', 'city', 'state', 
            'country', 'latitude', 'longitude', 'bedrooms', 'bathrooms', 
            'amenities', 'status', 'images', 'uploaded_images',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'landlord', 'created_at', 'updated_at')

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        property = Property.objects.create(**validated_data)
        
        for index, image in enumerate(uploaded_images):
            PropertyImage.objects.create(
                property=property, 
                image_url=image,
                is_primary=(index == 0) # Make first image primary
            )
            
        return property

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if uploaded_images:
            for image in uploaded_images:
                PropertyImage.objects.create(
                    property=instance, 
                    image_url=image
                )
                
        return instance
