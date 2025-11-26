import User from "../models/User.js";
import asyncHandler from 'express-async-handler';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.json({
    success: true,
    data: {
      ...user.toObject(),
      avatarUrl: user.profilePicture || ''
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const { name, email, bio, phone, location,skills, socialLinks } = req.body;
  
  // Check if email is being updated and if it's already taken
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }
  
  // Update fields
  user.name = name || user.name;
  user.email = email || user.email;
  user.bio = bio !== undefined ? bio : user.bio;
  user.phone = phone !== undefined ? phone : user.phone;
  user.location = location !== undefined ? location : user.location;
  user.skills = skills !== undefined ? skills : user.skills;
  user.socialLinks = socialLinks !== undefined ? socialLinks : user.socialLinks;
  
  const updatedUser = await user.save();
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      skills: updatedUser.skills,
      socialLinks: updatedUser.socialLinks,
      role: updatedUser.role,
      avatarUrl: updatedUser.profilePicture || ''
    }
  });
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current password and new password');
  }
  
  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Upload profile picture
// @route   POST /api/users/upload-profile-picture
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    const users = await User.find({
      name: { $regex: query, $options: "i" }
    }).select("name email");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
