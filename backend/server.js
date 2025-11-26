import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

dotenv.config();
connectDB();

// Fix ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  }
});

// 🔥 Attach io to every request (needed by messageController)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serve
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("SkillSphere API Running"));

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Accept `join`/`leave` events from client (frontend uses these names)
  socket.on("join", (chatId) => {
    socket.join(chatId);
  });

  socket.on("leave", (chatId) => {
    try {
      socket.leave(chatId);
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  });

  // If client emits a message via socket (optional), broadcast to the room
  socket.on("message", (msg) => {
    try {
      const room = msg.chatId || msg.chat;
      if (room) io.to(room.toString()).emit("message", msg);
    } catch (err) {
      console.error('Error broadcasting socket message:', err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
