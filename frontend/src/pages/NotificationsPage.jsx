import React, { useState, useEffect } from 'react';
import { communicationService } from '../services/communicationService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const data = await communicationService.getNotifications();
      setNotifications(data.results || data);
    } catch (e) {
      console.error(e);
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await communicationService.markAsRead(id);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await communicationService.markAllAsRead();
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
        <button onClick={handleMarkAllRead} className="text-blue-600 font-semibold hover:underline text-sm">
          Mark all as read
        </button>
      </div>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No notifications yet.</div>
        ) : (
          notifications.map(note => (
            <div key={note.id} className={`p-4 rounded-lg border ${note.is_read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between">
                <h3 className="font-bold text-gray-900">{note.title}</h3>
                {!note.is_read && (
                  <button onClick={() => handleMarkRead(note.id)} className="text-xs font-semibold text-blue-600 hover:underline">Mark as read</button>
                )}
              </div>
              <p className="text-gray-700 mt-1">{note.message}</p>
              <div className="text-xs text-gray-400 mt-2">{new Date(note.created_at).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
