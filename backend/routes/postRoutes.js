const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createPost,
  getPosts,
  toggleLike,
  addComment,
} = require("../controllers/postController");

router.post(
  "/",
  protect,
  upload.single("image"),
  createPost
);

router.get("/", getPosts);

// Likes and Comments
router.put("/:id/like", protect, toggleLike);
router.post("/:id/comment", protect, addComment);

module.exports = router;