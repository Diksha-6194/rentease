import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Home, DollarSign, CalendarCheck } from 'lucide-react';

const LandlordDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const data = await propertyService.getAllProperties();
        setProperties(data.results || data);
      } catch (error) {
        console.error('Error fetching dashboard properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, []);

  // Demo Data for Charts
  const revenueData = [
    { name: 'Jan', revenue: 12000 }, { name: 'Feb', revenue: 15000 },
    { name: 'Mar', revenue: 18000 }, { name: 'Apr', revenue: 22000 },
    { name: 'May', revenue: 25000 }, { name: 'Jun', revenue: 28000 },
  ];

  const bookingsData = [
    { name: 'Mon', bookings: 2 }, { name: 'Tue', bookings: 5 },
    { name: 'Wed', bookings: 3 }, { name: 'Thu', bookings: 7 },
    { name: 'Fri', bookings: 4 }, { name: 'Sat', bookings: 8 },
    { name: 'Sun', bookings: 6 },
  ];

  const occupancyData = [
    { name: 'Occupied', value: 75, color: '#3b82f6' },
    { name: 'Available', value: 25, color: '#e5e7eb' },
  ];

  const calculateTotalRevenue = () => {
    return properties.reduce((acc, prop) => acc + Number(prop.rent_amount), 0) * 0.8;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Landlord Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium">Overview of your property portfolio</p>
        </div>
        <Link to="/properties/create" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
          + Add New Property
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Home size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Total Properties</div>
            <div className="text-2xl font-black text-gray-900">{properties.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Est. Revenue</div>
            <div className="text-2xl font-black text-gray-900">${calculateTotalRevenue().toLocaleString()}<span className="text-sm text-gray-500">/mo</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Active Tenants</div>
            <div className="text-2xl font-black text-gray-900">12</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
            <CalendarCheck size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Pending Requests</div>
            <div className="text-2xl font-black text-gray-900">5</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Occupancy Rate</h3>
          <div className="h-[200px] w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Occupied (75%)</div>
            <div className="flex items-center gap-2 text-sm font-medium"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Available (25%)</div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Properties</h2>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties.map(prop => (
                <div key={prop.id} className="relative group">
                  <PropertyCard property={prop} />
                  <div className="absolute top-4 right-16 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Link to={`/properties/${prop.id}/edit`} className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-900 hover:text-white transition-colors">
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-gray-500 bg-gray-50 rounded-3xl border border-gray-100">
                <Home size={48} className="text-gray-300 mb-4" />
                <div className="text-xl font-bold text-gray-900 mb-2">You haven't listed any properties yet.</div>
                <Link to="/properties/create" className="mt-2 text-blue-600 font-bold hover:underline">Create your first listing</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;
