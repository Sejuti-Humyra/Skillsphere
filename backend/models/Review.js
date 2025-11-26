import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min:1, max:5 },
  comment: { type: String, default: "" },
  visible: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
