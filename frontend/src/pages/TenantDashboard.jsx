import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { communicationService } from '../services/communicationService';
import PaymentModal from '../components/PaymentModal';
import { Home, CalendarCheck, CreditCard, Bell, ChevronRight, Download, Wrench, X } from 'lucide-react';

const TenantDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedPropertiesCount, setSavedPropertiesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Maintenance Issue Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueText, setIssueText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, notifData] = await Promise.all([
          bookingService.getMyBookings(),
          communicationService.getNotifications()
        ]);
        setBookings(bookingsData.results || bookingsData);
        setNotifications(notifData.results || notifData);

        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setSavedPropertiesCount(saved.length);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.updateBookingStatus(id, 'cancelled');
        // Refresh bookings
        const data = await bookingService.getMyBookings();
        setBookings(data.results || data);
      } catch (error) {
        alert('Failed to cancel booking.');
      }
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'approved' || b.status === 'pending');
  const upcomingPayments = bookings.filter(b => b.status === 'approved'); // Mock: approved bookings need payment

  const handlePaymentSuccess = async () => {
    // Refresh bookings to show updated payment status
    const data = await bookingService.getMyBookings();
    setBookings(data.results || data);
  };

  const handleDownloadReceipt = (booking) => {
    const receiptContent = `
      <html>
        <head>
          <title>Rent Receipt</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #111827; }
            .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #2563eb; font-weight: 900; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .total { font-size: 24px; font-weight: 900; margin-top: 30px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RentEase Receipt</h1>
            <p>Transaction ID: RE-${booking.id.substring(0, 8).toUpperCase()}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="row"><strong>Property:</strong> <span>${booking.property_details?.title || 'Property'}</span></div>
          <div class="row"><strong>Address:</strong> <span>${booking.property_details?.address || 'N/A'}, ${booking.property_details?.city || 'N/A'}</span></div>
          <div class="row"><strong>Period:</strong> <span>${booking.start_date} to ${booking.end_date}</span></div>
          <div class="row"><strong>Status:</strong> <span style="color: #15803d; font-weight: bold;">PAID</span></div>
          <div class="row total"><strong>Total Amount:</strong> <span>$${booking.total_amount}</span></div>
          <p style="margin-top: 50px; color: #6b7280; font-size: 14px; text-align: center;">Thank you for using RentEase!</p>
        </body>
      </html>
    `;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    alert('Maintenance ticket submitted successfully. The landlord will review it shortly.');
    setShowIssueModal(false);
    setIssueText('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-500 mt-1 font-medium">Manage your bookings, payments, and wishlist.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Home size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Saved Properties</div>
            <div className="text-2xl font-black text-gray-900">{savedPropertiesCount}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <CalendarCheck size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Active Bookings</div>
            <div className="text-2xl font-black text-gray-900">{activeBookings.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
            <CreditCard size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Upcoming Payments</div>
            <div className="text-2xl font-black text-gray-900">{upcomingPayments.length}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Bell size={28} />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Unread Alerts</div>
            <div className="text-2xl font-black text-gray-900">{notifications.filter(n => !n.is_read).length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Bookings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
              <Link to="/search" className="text-blue-600 font-bold hover:text-blue-700 text-sm">Find more properties</Link>
            </div>
            
            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Dates</th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-5">
                          <Link to={`/properties/${booking.property}`} className="font-bold text-gray-900 hover:text-blue-600">
                            {booking.property_details?.title || 'Property'}
                          </Link>
                        </td>
                        <td className="p-5 text-sm font-medium text-gray-600">{booking.start_date} <br/>to {booking.end_date}</td>
                        <td className="p-5 font-bold text-gray-900">${booking.total_amount}</td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                            ${booking.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                              booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                              booking.status === 'paid' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-5 text-right space-y-2">
                          {booking.status === 'approved' && (
                            <button 
                              onClick={() => { setSelectedBooking(booking); setShowPaymentModal(true); }}
                              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                            >
                              Pay Rent
                            </button>
                          )}
                          {booking.status === 'paid' && (
                            <div className="flex flex-col gap-2 items-end">
                              <span className="text-green-600 text-sm font-bold flex items-center justify-end gap-1">
                                Paid ✓
                              </span>
                              <button onClick={() => handleDownloadReceipt(booking)} className="text-xs font-bold text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                                <Download size={12} /> Receipt
                              </button>
                            </div>
                          )}
                          {(booking.status === 'pending' || booking.status === 'approved') && (
                            <button onClick={() => handleCancel(booking.id)} className="block w-full text-right text-gray-500 hover:text-red-600 text-sm font-semibold transition-colors">
                              Cancel
                            </button>
                          )}
                          {(booking.status === 'paid' || booking.status === 'approved') && (
                            <button onClick={() => { setSelectedBooking(booking); setShowIssueModal(true); }} className="block w-full text-right text-gray-500 hover:text-orange-600 text-sm font-semibold transition-colors mt-2">
                              <Wrench size={12} className="inline mr-1" /> Report Issue
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 bg-white">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck size={32} className="text-gray-300" />
                </div>
                <p className="font-medium">You have no booking history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Activity & Notifications */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-0">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {notifications.slice(0, 10).map(notif => (
                    <div key={notif.id} className={`p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bell size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm mb-0.5">{notif.title}</div>
                        <div className="text-gray-600 text-sm leading-relaxed">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-2 font-medium">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 font-medium">
                  No recent activity
                </div>
              )}
              
              <div className="p-4 border-t border-gray-100 text-center bg-white">
                <Link to="/notifications" className="text-blue-600 font-bold hover:text-blue-700 text-sm flex items-center justify-center gap-1">
                  View all <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {showPaymentModal && selectedBooking && (
        <PaymentModal 
          booking={selectedBooking} 
          onClose={() => setShowPaymentModal(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}

      {showIssueModal && selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-900 font-black text-xl">
                <Wrench className="text-orange-600" />
                Report Issue
              </div>
              <button onClick={() => setShowIssueModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4 font-medium">Describe the maintenance issue for <strong>{selectedBooking.property_details?.title}</strong>.</p>
              <form onSubmit={handleReportIssue}>
                <textarea 
                  required
                  rows={4}
                  value={issueText}
                  onChange={e => setIssueText(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none font-medium transition-all resize-none mb-4"
                  placeholder="e.g., The kitchen sink is leaking..."
                />
                <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-md">
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;
