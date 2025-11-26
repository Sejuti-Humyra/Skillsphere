import React from "react";

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="w-1/3 bg-white shadow-lg h-full overflow-y-auto p-4">
      <h2 className="font-bold text-xl mb-4">Chats</h2>

      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat)}
          className="p-4 bg-gray-100 rounded-lg mb-2 cursor-pointer hover:bg-gray-200"
        >
          <p className="font-semibold">
            {chat.users?.map((u) => u.name).join(", ")}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
