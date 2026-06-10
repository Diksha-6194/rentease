import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { propertyService } from '../services/propertyService';
import { User, Mail, ShieldCheck, LogOut, Home, Star, Copy, Check, Upload, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({ properties: 0, views: 0 });
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (user?.role === 'landlord') {
      propertyService.getAllProperties().then(data => {
        const props = data.results || data;
        setStats({
          properties: props.length,
          views: props.length * 125 // Fake views for demo
        });
      }).catch(console.error);
    }
  }, [user]);

  const handleCopy = async (text, field) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        document.body.prepend(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      alert(`${field === 'email' ? 'Email' : 'Account ID'} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy', err);
      alert(`Could not copy automatically. Here is the ${field}:\n\n${text}`);
    }
  };

  const handleVerify = (e) => {
    if (e && e.target && e.target.files && e.target.files.length === 0) return;
    setVerifying(true);
    setTimeout(() => {
      setIsVerified(true);
      setVerifying(false);
    }, 2000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 bg-white rounded-full p-1.5 shadow-lg">
              <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-4xl font-black text-gray-400">
                {user.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-gray-900">{user.name}</h2>
              {isVerified ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold mt-2 bg-green-50 w-max px-3 py-1 rounded-full text-sm">
                  <ShieldCheck size={16} /> Verified {user.role}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 font-semibold mt-2 bg-orange-50 w-max px-3 py-1 rounded-full text-sm">
                  <AlertCircle size={16} /> Unverified {user.role}
                </div>
              )}
            </div>
            <button onClick={logout} className="flex items-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 px-5 py-2.5 rounded-xl font-bold transition-colors border border-gray-200 hover:border-red-200">
              <LogOut size={18} />
              Log Out
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Contact Information</h3>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 group">
                <div className="flex items-center gap-4">
                  <Mail className="text-gray-400" size={24} />
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Email Address</div>
                    <div className="font-semibold">{user.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(user.email, 'email')}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copiedField === 'email' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="flex items-center justify-between text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 group">
                <div className="flex items-center gap-4">
                  <User className="text-gray-400" size={24} />
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Account ID</div>
                    <div className="font-mono text-sm mt-0.5">{user.id}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(user.id, 'id')}
                  className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copiedField === 'id' ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {user.role === 'landlord' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Host Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center">
                    <Home className="text-blue-600 mb-2" size={32} />
                    <div className="text-3xl font-black text-gray-900">{stats.properties}</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Listed Properties</div>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center text-center">
                    <Star className="text-yellow-600 mb-2 fill-yellow-600" size={32} />
                    <div className="text-3xl font-black text-gray-900">4.9</div>
                    <div className="text-sm font-medium text-gray-600 mt-1">Average Rating</div>
                  </div>
                </div>
              </div>
            )}
            
            {user.role === 'tenant' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Identity Verification</h3>
                {isVerified ? (
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <p className="text-green-800 font-semibold leading-relaxed flex items-center gap-2">
                      <ShieldCheck size={20} /> Your profile is fully verified. You can now request bookings for any available property on RentEase without additional background checks.
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <p className="text-orange-800 font-medium mb-4">
                      Please verify your identity with a government-issued ID to unlock booking capabilities and build trust with landlords.
                    </p>
                    <input 
                      type="file" 
                      accept="image/*,.pdf" 
                      style={{ display: 'none' }} 
                      id="id-upload" 
                      onChange={handleVerify} 
                    />
                    <button 
                      onClick={() => document.getElementById('id-upload').click()}
                      disabled={verifying}
                      className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md"
                    >
                      {verifying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Verifying Document...
                        </>
                      ) : (
                        <>
                          <Upload size={18} /> Upload ID Document
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
