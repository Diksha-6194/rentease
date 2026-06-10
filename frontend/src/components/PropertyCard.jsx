import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Heart } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (saved.some(p => p.id === property.id)) {
      setIsFavorite(true);
    }
  }, [property.id]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isFavorite) {
      saved = saved.filter(p => p.id !== property.id);
    } else {
      saved.push(property);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(saved));
    setIsFavorite(!isFavorite);
    
    // Dispatch event so WishlistPage can update if we are on it
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    return `${baseUrl}${url}`;
  };

  const primaryImage = getImageUrl(
    property.images?.find((img) => img.is_primary)?.image_url || property.images?.[0]?.image_url
  );

  const getStatusBadge = () => {
    switch(property.status) {
      case 'available':
        return <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wide">Available</div>;
      case 'rented':
        return <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wide">Rented</div>;
      default:
        return <div className="absolute top-4 left-4 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm uppercase tracking-wide">Pending</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <Link to={`/properties/${property.id}`} className="block relative h-56 overflow-hidden">
        <img 
          src={primaryImage} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
        />
        {getStatusBadge()}
        <button 
          onClick={toggleFavorite}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white transition-colors shadow-sm z-10"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </button>
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-white">
          ${Number(property.rent_amount).toLocaleString()}/mo
        </div>
      </Link>
      
      <div className="p-5">
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin size={16} className="mr-1.5 text-blue-600" />
          <span className="truncate">{property.city}, {property.state}</span>
        </div>
        
        <Link to={`/properties/${property.id}`}>
          <h3 className="font-bold text-lg text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-4 text-gray-600 text-sm border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-1.5">
            <Bed size={16} className="text-blue-500" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath size={16} className="text-blue-500" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          <div className="ml-auto text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md capitalize">
            {property.property_type}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
