import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';

const LandlordBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data.results || data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, status);
      fetchBookings();
    } catch (error) {
      alert('Failed to update booking status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Booking Requests</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600">Property</th>
                    <th className="p-4 font-semibold text-gray-600">Dates</th>
                    <th className="p-4 font-semibold text-gray-600">Total Amount</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <Link to={`/properties/${booking.property}`} className="font-semibold text-blue-600 hover:underline">
                          {booking.property_details?.title || 'View Property'}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-600">{booking.start_date} to {booking.end_date}</td>
                      <td className="p-4 font-medium">${booking.total_amount}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                          ${booking.status === 'approved' ? 'bg-green-100 text-green-700' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                            booking.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-gray-100 text-gray-700'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatusUpdate(booking.id, 'approved')} className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors shadow-sm">Approve</button>
                            <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 text-sm font-semibold transition-colors shadow-sm">Reject</button>
                          </div>
                        )}
                        {booking.status === 'approved' && (
                           <button onClick={() => handleStatusUpdate(booking.id, 'completed')} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm">Mark Completed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-gray-50">No booking requests found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default LandlordBookingsPage;
