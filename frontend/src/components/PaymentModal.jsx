import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../services/bookingService';
import { X, CreditCard, Lock, CheckCircle } from 'lucide-react';

const PaymentModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mock Card State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Simulate Stripe call (Mock)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. We mock updating the booking status to "paid" directly since our mock payment endpoint might just create a session.
      await bookingService.updateBookingStatus(booking.id, 'paid');
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please check your card details and try again.');
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2 text-gray-900 font-black text-xl">
            <CreditCard className="text-blue-600" />
            Complete Payment
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 font-medium">Your receipt has been sent to your email.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Summary */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 mb-6 text-center">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Due</div>
              <div className="text-4xl font-black text-blue-600 mb-1">${booking.total_amount}</div>
              <div className="text-sm font-medium text-gray-600">{booking.property_details?.title}</div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Mock Stripe Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expiry</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">CVC</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="123"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading || !cardNumber || !expiry || !cvc}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Lock size={18} /> Pay ${booking.total_amount}
                    </>
                  )}
                </button>
                <div className="text-center text-xs font-semibold text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <Lock size={12} /> Payments are secured and encrypted (Demo Mode)
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
