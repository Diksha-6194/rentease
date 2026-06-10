import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import { Heart } from 'lucide-react';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('wishlistUpdated', loadWishlist);
    return () => window.removeEventListener('wishlistUpdated', loadWishlist);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh]">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 p-3 rounded-full">
          <Heart className="text-red-500 fill-red-500" size={24} />
        </div>
        <h1 className="text-3xl font-black text-gray-900">My Wishlist</h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <Heart className="mx-auto text-gray-300 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No saved properties yet</h2>
          <p className="text-gray-500">Properties you save will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
