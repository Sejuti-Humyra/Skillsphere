import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const createChat = async (req, res) => {
  try {
    const { participants, isGroup } = req.body;
    const chat = await Chat.create({ participants, isGroup });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getChatsForUser = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id }).populate('participants', 'name profilePicture');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Search users for chatting
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id; // auth middleware sets `id`

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search users by name, email, skills, or expertise
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { expertise: { $regex: q, $options: 'i' } },
            { skills: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
    .select('name email profilePicture expertise skills isOnline')
    .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: "Server error during user search" });
  }
};

// Get existing chat or create new one
export const getOrCreateChat = async (req, res) => {
  try {
    const { participantId, skillExchange } = req.body;
    const currentUserId = req.user._id;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: { 
        $all: [currentUserId, participantId] 
      }
    })
    .populate('participants', 'name email profilePicture expertise isOnline');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = new Chat({
      participants: [currentUserId, participantId],
      skillExchange: skillExchange || {
        skillOffered: "Your Skill",
        skillRequested: "Their Skill", 
        status: "pending"
      }
    });

    await newChat.save();
    
    // Populate the participants before sending response
    await newChat.populate('participants', 'name email profilePicture expertise isOnline');

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ message: "Server error creating chat" });
  }
};
