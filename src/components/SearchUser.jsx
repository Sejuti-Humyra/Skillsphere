// components/UserSearch.jsx
import { useState, useEffect } from "react";

export default function UserSearch({ 
  searchResults, 
  searchLoading, 
  onSearch, 
  onStartChat, 
  onBack 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Clear search when component unmounts or when going back
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.trim() === "") {
      onSearch("");
      return;
    }

    const newTimer = setTimeout(() => {
      onSearch(value);
    }, 500);

    setDebounceTimer(newTimer);
  };

  const handleStartChat = (user) => {
    onStartChat(user);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };

  // Get user's primary skill for expertise display
  const getUserExpertise = (user) => {
    if (user.expertise) return user.expertise;
    if (user.skills && user.skills.length > 0) return user.skills[0];
    return "General Skills";
  };

  // Get user location or bio for additional info
  const getUserAdditionalInfo = (user) => {
    if (user.location && user.bio) {
      return `${user.location} • ${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}`;
    }
    if (user.location) return user.location;
    if (user.bio) return user.bio.substring(0, 70) + (user.bio.length > 70 ? '...' : '');
    return "Skill Exchange Enthusiast";
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-800">
      {/* Header */}
      <div className="bg-slate-750 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700"
            >
              ← Back to Chats
            </button>
            <h2 className="text-xl font-bold text-white">Find Users to Chat With</h2>
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-6 border-b border-slate-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pl-12 pr-10 border border-slate-600"
          />
          <div className="absolute left-4 top-3.5 text-slate-400">
            🔍
          </div>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Find people to exchange skills with - search by name, email, or specific skills
        </p>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {searchLoading ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-slate-400">Searching users...</p>
          </div>
        ) : searchTerm && searchResults.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2">No users found</p>
            <p className="text-sm mb-4">Try searching with different terms</p>
            <button
              onClick={clearSearch}
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : !searchTerm ? (
          <div className="text-center text-slate-400 py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-semibold mb-2">Find Skill Exchange Partners</p>
            <p className="text-sm mb-4">Search for users by name, email, or skills to start chatting</p>
            <div className="max-w-md mx-auto text-left bg-slate-750 rounded-lg p-4 mt-6">
              <p className="text-slate-300 text-sm mb-2">💡 <strong>Search tips:</strong></p>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Try searching for specific skills like "React" or "Guitar"</li>
                <li>• Search by name or email address</li>
                <li>• Use partial matches for better results</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">
                Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  Clear Results
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="bg-slate-750 rounded-lg p-4 border border-slate-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold text-lg">
                              {user.name}
                            </h3>
                            <p className="text-purple-300 text-sm font-medium">
                              {getUserExpertise(user)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-slate-400 text-sm mt-1">
                          {getUserAdditionalInfo(user)}
                        </p>
                        
                        {user.skills && user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {user.skills.slice(0, 4).map((skill, index) => (
                              <span
                                key={index}
                                className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full border border-slate-500"
                              >
                                {skill}
                              </span>
                            ))}
                            {user.skills.length > 4 && (
                              <span className="text-xs text-slate-500 px-2 py-1">
                                +{user.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartChat(user)}
                      className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[120px]"
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-slate-750 px-6 py-4 border-t border-slate-700">
        <p className="text-slate-400 text-sm text-center">
          💬 Start a conversation and begin your skill exchange journey!
        </p>
      </div>
    </div>
  );
}