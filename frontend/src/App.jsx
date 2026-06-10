import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { communicationService } from './services/communicationService';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import PropertySearchPage from './pages/PropertySearchPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import CreatePropertyPage from './pages/CreatePropertyPage';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import LandlordBookingsPage from './pages/LandlordBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';

const Navigation = () => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      communicationService.getNotifications().then(data => {
        const notifications = data.results || data;
        const unread = notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      {/* Demo bar removed */}
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm">R</span>
          RentEase
        </Link>
        <div className="flex gap-6 items-center font-semibold text-gray-600">
          <Link to="/search" className="hover:text-blue-600 transition-colors">Search</Link>
          
          {user ? (
            <>
              {user.role === 'tenant' && (
                <Link to="/tenant-dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              )}
              {user.role === 'landlord' && (
                <>
                  <Link to="/dashboard" className="hover:text-blue-600 transition-colors">My Properties</Link>
                  <Link to="/manage-bookings" className="hover:text-blue-600 transition-colors">Requests</Link>
                  <Link to="/properties/create" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm ml-2">List Property</Link>
                </>
              )}
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
              <Link to="/wishlist" className="hover:text-blue-600 transition-colors">Wishlist</Link>
              <Link to="/chat" className="hover:text-blue-600 transition-colors">Messages</Link>
              <Link to="/notifications" className="relative hover:text-blue-600 transition-colors flex items-center">
                Alerts
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="text-blue-600 transition-colors ml-2">Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600 transition-colors">Log In</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm ml-2">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<PropertySearchPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
              </Route>
              
              {/* Tenant Routes */}
              <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
                <Route path="/tenant-dashboard" element={<TenantDashboard />} />
              </Route>

              {/* Landlord Routes */}
              <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
                <Route path="/dashboard" element={<LandlordDashboard />} />
                <Route path="/manage-bookings" element={<LandlordBookingsPage />} />
                <Route path="/properties/create" element={<CreatePropertyPage />} />
                <Route path="/properties/:id/edit" element={<CreatePropertyPage />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
