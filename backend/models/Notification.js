import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  title: String,
  body: String,
  data: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
