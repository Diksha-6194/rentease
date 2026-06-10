import React, { useState, useEffect, useContext, useRef } from 'react';
import { communicationService } from '../services/communicationService';
import { AuthContext } from '../context/AuthContext';
import { Send, User, MessageCircle, Clock } from 'lucide-react';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await communicationService.getConversations();
      setConversations(data.results || data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMessages = async (chat) => {
    setActiveChat(chat);
    try {
      const data = await communicationService.getMessages(chat.id);
      setMessages(data.results || data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      await communicationService.sendMessage(activeChat.id, newMessage);
      setNewMessage('');
      loadMessages(activeChat); // Reload to get new message
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="flex bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 overflow-hidden h-full">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
          <div className="p-6 border-b border-gray-100 bg-white">
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Connect with {user.role === 'tenant' ? 'landlords' : 'tenants'}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle size={40} className="mx-auto text-gray-300 mb-3" />
                No conversations yet
              </div>
            ) : (
              conversations.map(chat => {
                const partnerName = user.role === 'tenant' ? chat.landlord_details?.name : chat.tenant_details?.name;
                const isActive = activeChat?.id === chat.id;
                
                return (
                  <div 
                    key={chat.id} 
                    onClick={() => loadMessages(chat)}
                    className={`p-5 border-b border-gray-100 cursor-pointer transition-all ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isActive ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                        {partnerName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`font-bold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{partnerName || 'User'}</h3>
                        </div>
                        <div className="text-sm font-medium text-gray-500 truncate flex items-center gap-1">
                          <Home size={12} /> {chat.property_details?.title || 'Property Inquiry'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex md:w-2/3 flex-col bg-white relative">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100 bg-white flex items-center gap-4 z-10 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.role === 'tenant' ? activeChat.landlord_details?.name : activeChat.tenant_details?.name || 'User'}
                  </h2>
                  <div className="text-sm font-medium text-blue-600 flex items-center gap-1">
                    <Home size={14} /> {activeChat.property_details?.title}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 relative">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                      <MessageCircle size={32} />
                    </div>
                    <p className="font-medium">Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                          <p className="text-[15px] leading-relaxed">{msg.content}</p>
                          <div className={`flex items-center gap-1 text-[11px] mt-2 font-medium justify-end ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                            <Clock size={10} />
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex gap-3 items-end">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all p-1">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400" 
                      placeholder="Write your message here..." 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white h-14 w-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} className={newMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Your Messages</h3>
              <p className="font-medium">Select a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
