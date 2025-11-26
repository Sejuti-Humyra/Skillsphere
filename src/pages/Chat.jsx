import { useEffect, useState } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import UserSearch from "../components/SearchUser";
import io from "socket.io-client";
import api from '../api/axios';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Load all chat conversations
  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chat");
        setChats(res.data);
        setError("");
      } catch (err) {
        console.error("Error loading chats:", err);
        setError(err.response?.data?.message || "Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Load messages for active chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat) {
        setMessages([]);
        return;
      }

      try {
        const res = await api.get(`/chat/messages/${activeChat._id}`);
        setMessages(res.data);

        // Join socket room
        socket.emit("join", activeChat._id);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(err.response?.data?.message || "Unable to load messages");
      }
    };

    loadMessages();

    return () => {
      if (activeChat) socket.emit("leave", activeChat._id);
    };
  }, [activeChat]);

  // Listen for incoming messages
  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.chatId === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }

      setChats((prev) =>
        prev.map((c) =>
          c._id === msg.chatId
            ? {
                ...c,
                lastMessage: msg.text,
                lastMessageAt: msg.createdAt,
                unreadCount:
                  c._id === activeChat?._id ? 0 : (c.unreadCount || 0) + 1,
              }
            : c
        )
      );
    };

    socket.on("message", handleMessage);

    return () => socket.off("message", handleMessage);
  }, [activeChat]);

  // Mark messages as read
  useEffect(() => {
    if (activeChat) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChat._id ? { ...chat, unreadCount: 0 } : chat
        )
      );
    }
  }, [activeChat, messages]);

  // Search for users
  const handleSearchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const res = await api.get(`/chat/search/users?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (messageText) => {
    if (!activeChat || !messageText.trim()) return;

    try {
      const messageData = {
        chatId: activeChat._id,
        text: messageText.trim(),
        type: "text",
      };

      const res = await api.post("/chat/message", messageData);

      setMessages((prev) => [...prev, res.data]);

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === activeChat._id
            ? {
                ...chat,
                lastMessage: res.data.text,
                lastMessageAt: res.data.createdAt,
              }
            : chat
        )
      );

      socket.emit("message", res.data);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.response?.data?.message || "Unable to send message. Please try again.");
    }
  };

  // Start chat
  const handleStartChat = async (participant) => {
    try {
      const skillExchangeData = {
        skillOffered: "Your Skill",
        skillRequested: participant.expertise || "Their Skill",
        status: "pending",
      };

      const res = await api.post("/chat/direct", {
        participantId: participant._id,
        skillExchange: skillExchangeData,
      });

      const newChat = res.data;

      setChats((prev) => {
        const exists = prev.some((chat) => chat._id === newChat._id);
        if (exists) {
          return prev.map((chat) => (chat._id === newChat._id ? newChat : chat));
        }
        return [newChat, ...prev];
      });

      setActiveChat(newChat);
      setShowUserSearch(false);
      setSearchResults([]);
      setError("");
    } catch (err) {
      console.error("Error starting chat:", err);
      setError(err.response?.data?.message || "Unable to start chat. Please try again.");
    }
  };

  // Typing indicators
  const handleTyping = (isTyping) => {
    if (activeChat) {
      socket.emit("typing", {
        chatId: activeChat._id,
        isTyping,
        userId: user._id,
      });
    }
  };

  if (loading && chats.length === 0) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 items-center justify-center">
        <div className="text-white text-xl">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-500 text-white px-4 py-2 rounded-lg">
          {error}
          <button onClick={() => setError("")} className="ml-2 font-bold">
            ×
          </button>
        </div>
      )}

      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        setActiveChat={(chat) => {
          setActiveChat(chat);
          setMessages([]);
          setError("");
        }}
        loading={loading}
        onSearchClick={() => setShowUserSearch(true)}
      />

      {showUserSearch ? (
        <UserSearch
          searchResults={searchResults}
          searchLoading={searchLoading}
          onSearch={handleSearchUsers}
          onStartChat={handleStartChat}
          onBack={() => {
            setShowUserSearch(false);
            setSearchResults([]);
          }}
        />
      ) : (
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          socket={socket}
          user={user}
        />
      )}
    </div>
  );
}
