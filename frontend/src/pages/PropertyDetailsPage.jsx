import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import ImageGallery from '../components/ImageGallery';
import PropertyCard from '../components/PropertyCard';
import { MapPin, Bed, Bath, Home, Star, Shield, Info, CheckCircle2, User, Map as MapIcon, Share2, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getPropertyById(id);
        setProperty(data);
        
        // Fetch similar properties by city
        const similarData = await propertyService.getAllProperties({ city: data.city });
        const filteredSimilar = (similarData.results || similarData).filter(p => p.id !== id).slice(0, 3);
        setSimilarProperties(filteredSimilar);
      } catch (error) {
        console.error('Error fetching property', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await bookingService.createBooking({
        property: property.id,
        start_date: startDate,
        end_date: endDate
      });
      alert('Booking request sent successfully!');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      const errorMsg = err.response?.data?.dates?.[0] || 
                       err.response?.data?.start_date?.[0] ||
                       err.response?.data?.end_date?.[0] ||
                       'Failed to request booking.';
      alert(errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href);
      } else {
        // Fallback for older browsers or HTTP (if localhost isn't considered secure context in some setups)
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      alert('Property link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
      alert(`Could not copy automatically. Here is the link:\n\n${window.location.href}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) return <div className="text-center py-20 text-gray-500 font-bold text-xl">Property not found.</div>;

  const getStatusBadge = () => {
    switch(property.status) {
      case 'available':
        return <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">Available</span>;
      case 'rented':
        return <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-red-200">Rented</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-yellow-200">Pending</span>;
    }
  };

  // Mock amenities if none
  const amenitiesList = property.amenities && Object.keys(property.amenities).length > 0 
    ? Object.keys(property.amenities)
    : ['High-speed WiFi', 'Air Conditioning', 'Fully Equipped Kitchen', 'Washing Machine', 'Smart TV', 'Balcony/Patio', '24/7 Security', 'Gym Access'];

  // Default coordinates to Delhi if not set
  const position = [property.latitude || 28.6139, property.longitude || 77.2090];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {getStatusBadge()}
            <span className="text-sm font-semibold text-gray-500 flex items-center gap-1"><Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.9 (12 reviews)</span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{property.title}</h1>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
              title="Share property"
            >
              {isCopied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
            </button>
          </div>
          <div className="flex items-center text-gray-600 text-lg">
            <MapPin size={20} className="mr-2 text-blue-600" />
            <span>{property.address}, {property.city}, {property.state}, {property.country}</span>
          </div>
        </div>
        <div className="text-left md:text-right bg-blue-50/50 p-6 rounded-2xl border border-blue-100 md:min-w-[250px]">
          <div className="text-4xl md:text-5xl font-black text-blue-600">${Number(property.rent_amount).toLocaleString()}</div>
          <div className="text-blue-800 font-semibold mt-1">per month</div>
        </div>
      </div>

      <ImageGallery images={property.images} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Highlights */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-8 text-gray-900 flex items-center gap-2">
              <Info className="text-blue-600" /> Property Highlights
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl text-center hover:bg-blue-50 transition-colors">
                <Bed className="text-blue-600 mb-3" size={32} />
                <span className="font-bold text-xl text-gray-900 mb-1">{property.bedrooms}</span>
                <span className="text-gray-500 text-sm font-medium">Bedrooms</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl text-center hover:bg-blue-50 transition-colors">
                <Bath className="text-blue-600 mb-3" size={32} />
                <span className="font-bold text-xl text-gray-900 mb-1">{property.bathrooms}</span>
                <span className="text-gray-500 text-sm font-medium">Bathrooms</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl text-center hover:bg-blue-50 transition-colors">
                <Home className="text-blue-600 mb-3" size={32} />
                <span className="font-bold text-xl text-gray-900 mb-1 capitalize">{property.property_type}</span>
                <span className="text-gray-500 text-sm font-medium">Property Type</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-2xl text-center hover:bg-blue-50 transition-colors">
                <Shield className="text-blue-600 mb-3" size={32} />
                <span className="font-bold text-xl text-gray-900 mb-1">Verified</span>
                <span className="text-gray-500 text-sm font-medium">Status</span>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-900">About this property</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-lg">{property.description}</p>
          </section>

          {/* Amenities */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-900">What this place offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-3 text-gray-700 font-medium pb-4 border-b border-gray-50">
                  <CheckCircle2 className="text-green-500" size={20} />
                  {amenity}
                </div>
              ))}
            </div>
          </section>

          {/* Location Map */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-6 text-gray-900 flex items-center gap-2">
              <MapIcon className="text-blue-600" /> Location
            </h3>
            <div className="h-[400px] rounded-2xl overflow-hidden z-0 relative shadow-inner border border-gray-200">
              <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                  <Popup>
                    <div className="font-bold">{property.title}</div>
                    <div className="text-gray-500">{property.city}</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <p className="text-gray-500 text-sm mt-4 font-medium flex items-center gap-1.5">
              <MapPin size={16} /> Exact location provided after booking confirmation.
            </p>
          </section>

        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Booking Card */}
          <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-24 z-10">
            <h2 className="text-2xl font-black mb-6 text-gray-900">Book your stay</h2>
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Check-in</label>
                  <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-transparent outline-none font-medium text-gray-900" />
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Check-out</label>
                  <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-transparent outline-none font-medium text-gray-900" />
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <span className="text-gray-600 font-semibold">Security Deposit</span>
                <span className="font-black text-xl text-gray-900">${Number(property.deposit_amount).toLocaleString()}</span>
              </div>
              
              <button disabled={bookingLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                {bookingLoading ? 'Processing...' : 'Request to Book'}
              </button>
              <p className="text-center text-sm font-semibold text-gray-500 pt-2">You won't be charged yet</p>
            </form>
          </div>

          {/* Owner Info */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 text-gray-900">Hosted by</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">Verified Owner</div>
                <div className="text-sm text-gray-500 font-medium">Joined {new Date(property.created_at).getFullYear()}</div>
              </div>
            </div>
            <Link to="/chat" className="block w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 rounded-xl text-center transition-colors">
              Contact Host
            </Link>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <div className="mt-20 pt-16 border-t border-gray-100">
          <h2 className="text-3xl font-black text-gray-900 mb-8">Similar properties in {property.city}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
