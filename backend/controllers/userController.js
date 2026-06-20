const User = require("../models/User");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Get currently logged-in user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile (name, bio, profilePic)
const updateUserProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    if (req.file) {
      // Upload to Cloudinary stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "connect-avatars",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({
              message: error.message,
            });
          }

          updateData.profilePic = result.secure_url;

          const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true }
          ).select("-password");

          return res.json(updatedUser);
        }
      );

      streamifier
        .createReadStream(req.file.buffer)
        .pipe(uploadStream);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true }
      ).select("-password");

      return res.json(updatedUser);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all posts created by the logged-in user
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .populate("user", "name")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Search users by name (case-insensitive)
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query.trim()) {
      return res.json([]);
    }

    const users = await User.find({
      name: { $regex: query.trim(), $options: "i" },
    })
      .select("name bio profilePic followers following")
      .limit(20);

    // Attach post count to each user
    const results = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ user: user._id });
        return {
          _id: user._id,
          name: user.name,
          bio: user.bio,
          profilePic: user.profilePic,
          followersCount: user.followers?.length || 0,
          postCount,
        };
      })
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  searchUsers,
};
