import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Star, Home, ArrowRight } from 'lucide-react';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    propertyService.getAllProperties({ limit: 4 }).then(data => {
      setFeatured(data.results ? data.results.slice(0, 4) : data.slice(0, 4));
    }).catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?city=${searchQuery}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Hero" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 to-gray-50"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 mx-auto">
          <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-full text-sm mb-6 shadow-sm">
            #1 Rental Platform in India
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Find Your Perfect Home <br/> With <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">RentEase</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto font-medium">
            Discover thousands of verified rental properties in your favorite cities. Hassle-free booking, zero brokerages, and secure payments.
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-xl border border-gray-100 flex items-center">
            <div className="flex-1 flex items-center pl-4">
              <MapPin className="text-gray-400 mr-3" size={24} />
              <input 
                type="text" 
                placeholder="Search by city (e.g., Delhi, Mumbai)..." 
                className="w-full text-lg outline-none text-gray-800 placeholder-gray-400 bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-md hover:shadow-lg flex items-center">
              <Search className="mr-2" size={20} />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-500 text-lg">Handpicked premium listings just for you</p>
          </div>
          <Link to="/search" className="hidden sm:flex items-center font-bold text-blue-600 hover:text-blue-700 group">
            View All <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={18} />
          </Link>
        </div>
        
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">No featured properties available at the moment.</div>
        )}
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-500/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10K+</div>
            <div className="text-blue-100 font-medium">Verified Properties</div>
          </div>
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">50K+</div>
            <div className="text-blue-100 font-medium">Happy Tenants</div>
          </div>
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">100+</div>
            <div className="text-blue-100 font-medium">Cities Covered</div>
          </div>
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">4.9/5</div>
            <div className="text-blue-100 font-medium">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Popular Cities</h2>
        <p className="text-gray-500 text-lg mb-10">Find homes in India's top metropolitan areas</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Delhi', 'Mumbai', 'Bangalore', 'Gurgaon'].map((city, i) => (
            <Link key={city} to={`/search?city=${city}`} className="relative h-64 rounded-2xl overflow-hidden group">
              <img src={`https://images.unsplash.com/photo-1595843477815-ff50106203be?auto=format&fit=crop&w=600&q=80&sig=${i}`} alt={city} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-1">{city}</h3>
                <span className="text-gray-200 text-sm">Explore properties</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">R</span>
              RentEase
            </div>
            <p className="text-sm">Simplifying real estate for everyone. Rent, buy, and list properties with absolute ease and security.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white">Browse Properties</Link></li>
              <li><Link to="/login" className="hover:text-white">Landlord Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} RentEase Technologies. All rights reserved. (Demo Environment)
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
