import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    profilePicture: {
      type: String,
      default: ''
    },
    skills: [{
      type: String
    }],
    socialLinks: {
      website: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", userSchema);