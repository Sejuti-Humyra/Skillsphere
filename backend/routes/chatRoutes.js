import express from "express";
import { 
  createChat, 
  getChatsForUser, 
  searchUsers,
  getOrCreateChat 
} from "../controllers/chatController.js";
import { sendMessage, getMessages } from "../controllers/messageController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Existing routes
router.post('/create', auth, createChat);
router.get('/', auth, getChatsForUser);
router.post('/message', auth, sendMessage);
router.get('/messages/:chatId', auth, getMessages);

// New routes for search functionality
// Keep legacy route and add route that matches frontend: `/search/users`
router.get('/search-users', auth, searchUsers); // Search for users to chat with (legacy)
router.get('/search/users', auth, searchUsers); // Search for users to chat with (frontend expects /search/users)

// Keep legacy and add `/direct` endpoint which frontend uses to get-or-create a chat
router.post('/get-or-create', auth, getOrCreateChat); // Get existing chat or create new one (legacy)
router.post('/direct', auth, getOrCreateChat); // Frontend uses /direct to start/get chat

export default router;