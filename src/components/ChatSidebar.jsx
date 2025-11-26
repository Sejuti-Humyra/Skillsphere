// components/ChatSidebar.jsx
import { useState } from "react";

export default function ChatSidebar({ 
  chats, 
  activeChat, 
  setActiveChat, 
  loading,
  onSearchClick 
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chats and remove duplicates
  const filteredChats = chats.filter((chat, index, self) => {
    // First, filter by search term
    const participant = chat.participants?.[0];
    if (!participant) return false;
    
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.skillExchange?.skillOffered.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.skillExchange?.skillRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
           chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Then, remove duplicates by participant ID
    const isFirstOccurrence = self.findIndex(c => 
      c.participants[0]?._id === participant._id
    ) === index;
    
    return matchesSearch && isFirstOccurrence;
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in-progress': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border-b border-slate-700 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <button
            onClick={onSearchClick}
            className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            + New Chat
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-slate-600"
          />
          <div className="absolute right-3 top-2 text-slate-400">
            🔍
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg mb-2">No conversations yet</p>
            <p className="text-sm">Start a chat by connecting with someone for skill exchange!</p>
            <button
              onClick={onSearchClick}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Find Users
            </button>
          </div>
        ) : (
          filteredChats.map(chat => {
            const participant = chat.participants?.[0];
            if (!participant) return null;

            return (
              <div
                key={chat._id}
                className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                  activeChat?._id === chat._id 
                    ? 'bg-slate-700' 
                    : 'hover:bg-slate-750'
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    {participant.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {participant.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {chat.lastMessageAt && (
                          <span className="text-xs text-slate-400">
                            {formatTime(chat.lastMessageAt)}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {chat.skillExchange?.status && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(chat.skillExchange.status)}`}></span>
                        <span className="text-xs text-slate-400 capitalize">
                          {chat.skillExchange.status.replace('-', ' ')}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-slate-300 text-sm truncate mb-2">
                      {chat.lastMessage || "Start a conversation..."}
                    </p>
                    
                    {chat.skillExchange && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                          You: {chat.skillExchange.skillOffered}
                        </span>
                        <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">
                          Them: {chat.skillExchange.skillRequested}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}