import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const router = express.Router();
import { auth } from "../middleware/auth.js";
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,searchUsers
} from "../controllers/userController.js";
import multer from "multer";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created:', uploadsDir);
}

// Supported image MIME types
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create safe filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `profile-${uniqueSuffix}-${baseName}${fileExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if the file is an allowed image type
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file
  },
  fileFilter: fileFilter
});

// Enhanced error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Only one file allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name. Use "profilePicture" as field name.';
        break;
      default:
        message = `Upload error: ${error.message}`;
    }
    
    return res.status(400).json({
      success: false,
      message: message
    });
  } else if (error) {
    // Handle other errors (fileFilter errors, etc.)
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

// Validation middleware for file upload
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file selected. Please choose an image file.'
    });
  }
  next();
};

// Routes
router.route('/profile')
  .get(auth, getUserProfile)
  .put(auth, updateUserProfile);

router.route('/password')
  .put(auth, updatePassword);
router.get("/search", auth, searchUsers);

// Health check route for uploads
router.get('/uploads-health', (req, res) => {
  const health = {
    uploadsDirectory: uploadsDir,
    directoryExists: fs.existsSync(uploadsDir),
    writable: false,
    timestamp: new Date().toISOString()
  };

  // Check if directory is writable
  try {
    const testFile = path.join(uploadsDir, `test-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    health.writable = true;
  } catch (error) {
    health.writable = false;
    health.error = error.message;
  }

  res.json({
    success: true,
    data: health
  });
});

export default router;