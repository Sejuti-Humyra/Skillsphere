import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetType: { type: String, enum: ["user","skill","review","message"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  details: String,
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolvedAt: Date
}, { timestamps: true });

reportSchema.index({ resolved: 1, createdAt: -1 });

export default mongoose.model("Report", reportSchema);
