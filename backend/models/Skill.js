import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Skill title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    price: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    // ⭐ Rating system (avgRating & review count)
    avgRating: {
      type: Number,
      default: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
    },

    // 🔄 Skill Exchange Option
    exchangeOffer: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Full-text search for title + description + tags
skillSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  category: "text",
});

export default mongoose.model("Skill", skillSchema);
