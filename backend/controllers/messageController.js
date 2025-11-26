import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // create message
    const msg = await Message.create({ chat: chatId, sender: req.user._id, text });

    // update chat preview
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text, lastMessageAt: new Date() });

    // populate sender for response
    const populated = await Message.findById(msg._id).populate('sender', 'name profilePicture');

    const payload = {
      _id: populated._id,
      chat: populated.chat,
      chatId: populated.chat,
      sender: populated.sender,
      text: populated.text,
      createdAt: populated.createdAt,
    };

    // Emit via socket.io to the chat room if io is attached to req
    try {
      if (req.io && chatId) {
        req.io.to(chatId.toString()).emit('message', payload);
      }
    } catch (emitErr) {
      console.error('Socket emit error:', emitErr);
    }

    res.status(201).json(payload);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const msgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 }).limit(100).populate('sender', 'name profilePicture');
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
