import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: String, default: "" },
  lastMessageAt: { type: Date }
}, { timestamps: true });

chatSchema.index({ participants: 1 });

export default mongoose.model("Chat", chatSchema);
