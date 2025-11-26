// components/MessageBubble.jsx
export default function MessageBubble({ msg }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const isMine = msg.sender === user._id;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex ${isMine ? "flex-row-reverse" : "flex-row"} items-end space-x-2 max-w-xs lg:max-w-md`}>
        {/* Avatar - only show for received messages */}
        {!isMine && (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {msg.sender?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        
        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isMine
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white/20 text-white rounded-bl-none"
          }`}
        >
          {/* Sender name - only show for received messages */}
          {!isMine && msg.sender?.name && (
            <div className="text-xs font-semibold text-purple-300 mb-1">
              {msg.sender.name}
            </div>
          )}
          
          {/* Message text */}
          <p className="text-sm">{msg.text}</p>
          
          {/* Message time */}
          <div
            className={`text-xs mt-1 text-right ${
              isMine ? "text-blue-200" : "text-slate-300"
            }`}
          >
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}