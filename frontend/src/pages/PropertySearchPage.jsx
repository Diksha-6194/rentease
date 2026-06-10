import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import { Search, Filter, SlidersHorizontal, Map as MapIcon, Grid } from 'lucide-react';
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

const PropertySearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  
  // Filters State
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    min_rent: searchParams.get('min_rent') || '',
    max_rent: searchParams.get('max_rent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    property_type: searchParams.get('property_type') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    amenities: searchParams.getAll('amenities') || [],
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProperties(filters);
    // eslint-disable-next-line
  }, [searchParams]);

  async function fetchProperties(currentFilters) {
    setLoading(true);
    try {
      // Clean up empty filters
      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );
      // Remove amenities from API params as we filter locally
      const { amenities, ...apiFilters } = cleanFilters;
      const data = await propertyService.getAllProperties({ ...apiFilters, status: 'available' });
      
      let fetchedProps = data.results || data;
      
      // Local amenities filtering
      if (amenities && amenities.length > 0) {
        fetchedProps = fetchedProps.filter(prop => {
          return amenities.every(amenity => prop.amenities && prop.amenities[amenity] === true);
        });
      }
      
      setProperties(fetchedProps);
    } catch (error) {
      console.error('Error fetching properties', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => {
        if (Array.isArray(v)) return v.length > 0;
        return v !== '' && v != null;
      })
    );
    setSearchParams(cleanFilters);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    setFilters({ ...filters, amenities: newAmenities });
  };

  // Default center to India map if properties list is empty
  const mapCenter = properties.length > 0 
    ? [properties[0].latitude || 28.6139, properties[0].longitude || 77.2090]
    : [28.6139, 77.2090];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-6 text-center">Find Your Perfect Home</h1>
        
        {/* Main Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-3 relative z-20">
          <div className="flex-1 relative flex items-center pl-4 bg-gray-50 rounded-xl border border-gray-100 focus-within:border-blue-500 transition-colors">
            <Search className="text-gray-400 mr-2" size={20} />
            <input 
              type="text"
              name="city"
              placeholder="Where do you want to live? (e.g. Delhi, Mumbai)"
              value={filters.city}
              onChange={handleFilterChange}
              className="w-full py-3.5 bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
            />
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-colors ${showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            <SlidersHorizontal size={20} />
            <span className="hidden md:inline">Filters</span>
          </button>
          
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm whitespace-nowrap">
            Search
          </button>
        </form>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-4 p-6 bg-white border border-gray-100 shadow-xl rounded-2xl animate-fade-in z-10 relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input type="number" name="min_rent" placeholder="Min ₹" value={filters.min_rent} onChange={handleFilterChange} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                  <input type="number" name="max_rent" placeholder="Max ₹" value={filters.max_rent} onChange={handleFilterChange} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Property Type</label>
                <select name="property_type" value={filters.property_type} onChange={handleFilterChange} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white">
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Bedrooms</label>
                <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white">
                  <option value="">Any</option>
                  <option value="1">1+ Beds</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
                <select name="ordering" value={filters.ordering} onChange={handleFilterChange} className="w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white">
                  <option value="-created_at">Newest First</option>
                  <option value="rent_amount">Lowest Price</option>
                  <option value="-rent_amount">Highest Price</option>
                </select>
              </div>

              <div className="md:col-span-4 mt-2 border-t border-gray-100 pt-4">
                <label className="block text-sm font-bold text-gray-700 mb-3">Amenities</label>
                <div className="flex flex-wrap gap-4">
                  {['wifi', 'ac', 'gym', 'pool'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700 capitalize">{amenity === 'ac' ? 'AC' : amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {loading ? 'Searching...' : `${properties.length} Properties Found`}
        </h2>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Grid size={18} /> Grid View
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MapIcon size={18} /> Map View
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties.map(prop => <PropertyCard key={prop.id} property={prop} />)
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-500 bg-gray-50 rounded-3xl border border-gray-100">
                <Filter size={48} className="text-gray-300 mb-4" />
                <div className="text-xl font-bold text-gray-900 mb-2">No matches found</div>
                <p>Try adjusting your filters or searching for a different city.</p>
                <button onClick={() => { setFilters({...filters, city:'', min_rent:'', max_rent:'', bedrooms:'', property_type:'', amenities:[]}); handleSearch({preventDefault:()=>{}}); }} className="mt-4 text-blue-600 font-bold hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[600px] w-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
            <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map(prop => (
                <Marker key={prop.id} position={[prop.latitude || 28.6139, prop.longitude || 77.2090]}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <img 
                        src={prop.images && prop.images.length > 0 && prop.images[0].image_url ? (prop.images[0].image_url.startsWith('http') ? prop.images[0].image_url : `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${prop.images[0].image_url}`) : 'https://via.placeholder.com/400x300'} 
                        className="w-full h-32 object-cover rounded-lg mb-2"
                        alt={prop.title}
                      />
                      <div className="font-bold text-gray-900 truncate">{prop.title}</div>
                      <div className="text-blue-600 font-black mb-2">${Number(prop.rent_amount).toLocaleString()}/mo</div>
                      <a href={`/properties/${prop.id}`} className="block w-full bg-gray-900 text-white text-center py-1.5 rounded-lg text-sm font-bold hover:bg-gray-800">
                        View Details
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )
      )}
    </div>
  );
};

export default PropertySearchPage;
