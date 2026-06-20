const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  searchUsers,
} = require("../controllers/userController");

// Search users — public endpoint
router.get("/search", searchUsers);

// Get user profile
router.get("/profile", protect, getUserProfile);

// Update user profile (with avatar file upload support)
router.put(
  "/profile",
  protect,
  upload.single("profilePic"),
  updateUserProfile
);

// Get user's own posts
router.get("/profile/posts", protect, getUserPosts);

module.exports = router;
