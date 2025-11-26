// components/ChatWindow.jsx
import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble"; // Import the MessageBubble component

export default function ChatWindow({ activeChat, messages, onSendMessage, onTyping, socket, user }) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleTyping = (data) => {
      if (data.userId !== user._id) {
        setTypingUser(data.userId);
        setIsTyping(data.isTyping);
        
        if (data.isTyping) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUser(null);
          }, 3000);
        }
      }
    };

    socket.on("typing", handleTyping);

    return () => {
      socket.off("typing", handleTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, user._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeChat) {
      onSendMessage(newMessage);
      setNewMessage("");
      handleTypingStop();
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      onTyping(true);
    }
  };

  const handleTypingStop = () => {
    onTyping(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (e.target.value.trim()) {
      handleTypingStart();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 1000);
    } else {
      handleTypingStop();
    }
  };

  // Get the other participant (not the current user)
  const getOtherParticipant = () => {
    if (!activeChat?.participants) return null;
    return activeChat.participants.find(participant => participant._id !== user._id);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-800">
        <div className="text-center text-slate-400">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">No Chat Selected</h3>
          <p>Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex-1 flex flex-col bg-slate-800">
      {/* Chat Header */}
      <div className="bg-slate-750 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {otherParticipant?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {otherParticipant?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                {otherParticipant?.name || "Unknown User"}
              </h2>
              <p className="text-slate-400 text-sm">
                {otherParticipant?.isOnline ? "Online" : "Offline"} • 
                {otherParticipant?.expertise || "Skill Exchange"}
              </p>
            </div>
          </div>
          
          {activeChat.skillExchange && (
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Skill Exchange</div>
              <div className="flex space-x-2">
                <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm">
                  You: {activeChat.skillExchange.skillOffered}
                </span>
                <span className="bg-purple-900 text-purple-200 px-3 py-1 rounded-lg text-sm">
                  Them: {activeChat.skillExchange.skillRequested}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area - Using MessageBubble component */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="text-4xl mb-4">👋</div>
            <p className="text-lg">Start the conversation!</p>
            <p className="text-sm">Send a message to begin your skill exchange journey</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message._id} msg={message} />
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && typingUser !== user._id && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {otherParticipant?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="bg-slate-700 text-white px-4 py-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-slate-750 px-6 py-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-slate-600"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}