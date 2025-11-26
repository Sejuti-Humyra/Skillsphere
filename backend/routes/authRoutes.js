import express from "express";
import { register, login, me } from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";
import User from "../models/User.js";
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find({}).select('name password');
    console.log("📊 All users:", users);
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
