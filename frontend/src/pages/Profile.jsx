import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  FiHeart,
  FiMessageCircle,
  FiCamera,
  FiX,
  FiImage
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal toggle states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Edit Profile form fields
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [selectedPic, setSelectedPic] = useState(null);
  const [picPreview, setPicPreview] = useState("");

  // Post Upload form fields (direct upload support from profile)
  const [createCaption, setCreateCaption] = useState("");
  const [createImage, setCreateImage] = useState(null);

  // Modal comment text field
  const [modalCommentText, setModalCommentText] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfileAndPosts = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      // Fetch user profile metadata
      const profileRes = await API.get("/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileRes.data);
      setEditName(profileRes.data.name);
      setEditBio(profileRes.data.bio || "");

      // Fetch user's own posts list
      const postsRes = await API.get("/users/profile/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(postsRes.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, []);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("bio", editBio);
      if (selectedPic) {
        formData.append("profilePic", selectedPic);
      }

      const res = await API.put("/users/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(res.data);
      setIsEditModalOpen(false);
      setSelectedPic(null);
      setPicPreview("");

      // Refresh data
      fetchProfileAndPosts();
    } catch (error) {
      console.log(error);
      alert("Failed to update profile");
    }
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPic(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  // Direct post creation from Profile page
  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("image", createImage);
      formData.append("caption", createCaption);

      await API.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCreateCaption("");
      setCreateImage(null);
      setIsCreateModalOpen(false);

      // Refresh posts grid & profile count
      fetchProfileAndPosts();
    } catch (error) {
      console.log(error);
      alert("Failed to create post");
    }
  };

  // Decode user ID from token
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch (e) {
      return null;
    }
  };

  const handleLikeToggle = async (postId) => {
    try {
      const res = await API.put(`/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update posts grid list
      setPosts(posts.map((p) => (p._id === postId ? res.data : p)));

      // Update selected detail post view state
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!modalCommentText.trim()) return;

    try {
      const res = await API.post(`/posts/${postId}/comment`, { text: modalCommentText }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(res.data);
      }
      setModalCommentText("");
    } catch (error) {
      console.log(error);
      alert("Failed to submit comment");
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsDetailModalOpen(true);
  };

  const getAvatarLetter = () => {
    return profile?.name ? profile.name.charAt(0) : "?";
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatPostDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <>
        <Navbar onCreatePostClick={() => setIsCreateModalOpen(true)} />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <div className="avatar-ring" style={{ width: "50px", height: "50px", animation: "heart-pop 1.2s infinite" }}>
            <div className="avatar-inner" style={{ fontSize: "16px", backgroundColor: "#f43f5e" }}>C</div>
          </div>
        </div>
      </>
    );
  }

  const currentUserId = getUserIdFromToken();

  return (
    <>
      <Navbar onCreatePostClick={() => setIsCreateModalOpen(true)} />

      <div className="profile-container">
        {/* Profile Header section */}
        <header className="profile-header-section">
          <div className="profile-avatar-container">
            <div className="profile-avatar-wrapper">
              {profile?.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-initial">
                  {getAvatarLetter()}
                </div>
              )}
            </div>
            <div
              className="profile-avatar-overlay"
              onClick={() => setIsEditModalOpen(true)}
            >
              Change Pic
            </div>
          </div>

          <div className="profile-info-container">
            <div className="profile-info-row-1">
              <h2 className="profile-username">{profile?.name}</h2>
              <button
                className="profile-edit-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>
            </div>

            <div className="profile-info-row-2">
              <span className="profile-stat">
                <span className="profile-stat-number">{posts.length}</span> posts
              </span>
              <span className="profile-stat">
                <span className="profile-stat-number">{profile?.followers?.length || 0}</span> followers
              </span>
              <span className="profile-stat">
                <span className="profile-stat-number">{profile?.following?.length || 0}</span> following
              </span>
            </div>

            <div className="profile-info-row-3">
              <h3 className="profile-full-name">{profile?.name}</h3>
              <p className="profile-bio">
                {profile?.bio || "No bio yet. Tap 'Edit Profile' to add one!"}
              </p>
            </div>
          </div>
        </header>

        {/* User's Posts Grid */}
        {posts.length > 0 ? (
          <div className="profile-posts-grid">
            {posts.map((post) => (
              <div
                key={post._id}
                className="profile-grid-item"
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={post.image}
                  alt={post.caption || "Post"}
                  className="profile-grid-img"
                />
                <div className="profile-grid-overlay">
                  <div className="profile-grid-overlay-item">
                    <FiHeart />
                    <span>{post.likes?.length || 0}</span>
                  </div>
                  <div className="profile-grid-overlay-item">
                    <FiMessageCircle />
                    <span>{post.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-empty-state">
            <div className="profile-empty-icon">
              <FiCamera />
            </div>
            <h3 className="profile-empty-title">No Posts Yet</h3>
            <p className="profile-empty-subtitle">
              When you share photos, they will appear here on your profile page.
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit profile</span>
              <button
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-body">
              {/* Profile Image zone */}
              <div className="file-upload-zone" style={{ minHeight: "160px", padding: "15px" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicChange}
                  className="file-upload-input"
                />

                {picPreview || profile?.profilePic ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <img
                      src={picPreview || profile.profilePic}
                      alt="Avatar Preview"
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid var(--border-primary)",
                      }}
                    />
                    <span className="select-btn" style={{ padding: "4px 10px", fontSize: "12px" }}>Change Photo</span>
                  </div>
                ) : (
                  <>
                    <FiImage className="upload-icon" style={{ fontSize: "32px", marginBottom: "8px" }} />
                    <span className="upload-title" style={{ fontSize: "14px" }}>Upload a profile picture</span>
                    <button type="button" className="select-btn" style={{ padding: "4px 10px", fontSize: "12px" }}>Select Photo</button>
                  </>
                )}
              </div>

              {/* Profile Input fields */}
              <div className="modal-form-inputs" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                    required
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    style={{
                      width: "100%",
                      height: "80px",
                      padding: "10px",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "6px",
                      resize: "none",
                      fontSize: "14px",
                      fontFamily: "var(--font-body)",
                    }}
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="modal-submit-container">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={!editName.trim()}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {isDetailModalOpen && selectedPost && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="detail-modal-image-container">
              <img
                src={selectedPost.image}
                alt="Selected Post"
                className="detail-modal-image"
              />
            </div>

            <div className="detail-modal-sidebar">
              {/* Header */}
              <div className="detail-modal-header">
                <div className="post-header-left">
                  <div className="avatar-ring" style={{ width: "32px", height: "32px", padding: "1.8px" }}>
                    {profile?.profilePic ? (
                      <img
                        src={profile.profilePic}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="avatar-inner" style={{ fontSize: "10px" }}>
                        {getAvatarLetter()}
                      </div>
                    )}
                  </div>
                  <span className="post-user-name" style={{ fontSize: "13px" }}>
                    {selectedPost.user?.name || profile?.name}
                  </span>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setIsDetailModalOpen(false)}
                  style={{ fontSize: "18px" }}
                  type="button"
                >
                  <FiX />
                </button>
              </div>

              {/* Caption details scroll container */}
              <div className="detail-modal-content-area">
                <div className="detail-modal-comment-row">
                  <div className="avatar-ring" style={{ width: "32px", height: "32px", padding: "1.8px", flexShrink: 0 }}>
                    {profile?.profilePic ? (
                      <img
                        src={profile.profilePic}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="avatar-inner" style={{ fontSize: "10px" }}>
                        {getAvatarLetter()}
                      </div>
                    )}
                  </div>
                  <div className="detail-modal-comment-text">
                    <span className="post-caption-username" style={{ fontSize: "13px" }}>
                      {selectedPost.user?.name || profile?.name}
                    </span>
                    <span className="post-caption-text" style={{ fontSize: "13px" }}>
                      {selectedPost.caption}
                    </span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="detail-modal-comments-list">
                  {selectedPost.comments?.map((c, index) => (
                    <div key={c._id || index} className="detail-modal-comment-item">
                      <div className="avatar-ring" style={{ width: "32px", height: "32px", padding: "1.8px", flexShrink: 0 }}>
                        {c.user?.profilePic ? (
                          <img
                            src={c.user.profilePic}
                            alt="Avatar"
                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="avatar-inner" style={{ fontSize: "10px" }}>
                            {c.user?.name ? c.user.name.charAt(0) : "?"}
                          </div>
                        )}
                      </div>
                      <div className="detail-modal-comment-body">
                        <span className="detail-modal-comment-username">
                          {c.user?.name || "Anonymous"}
                        </span>
                        <span className="detail-modal-comment-text">{c.text}</span>
                        <span className="detail-modal-comment-date">
                          {formatTimeAgo(c.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions & Likes & timestamp */}
              <div className="detail-modal-footer">
                <div style={{ display: "flex", gap: "16px", marginBottom: "6px" }}>
                  <button
                    onClick={() => handleLikeToggle(selectedPost._id)}
                    className={`action-btn btn-like ${selectedPost.likes?.includes(currentUserId) ? "liked" : ""}`}
                    style={{ fontSize: "22px" }}
                  >
                    {selectedPost.likes?.includes(currentUserId) ? <FaHeart /> : <FiHeart />}
                  </button>
                  <button className="action-btn" style={{ fontSize: "22px" }}>
                    <FiMessageCircle />
                  </button>
                </div>

                <div className="post-likes-count" style={{ padding: "0 0 4px", fontSize: "14px" }}>
                  {(selectedPost.likes?.length || 0).toLocaleString()} {selectedPost.likes?.length === 1 ? "like" : "likes"}
                </div>
                <div className="post-timestamp" style={{ padding: 0 }}>
                  {formatPostDate(selectedPost.createdAt)}
                </div>
              </div>

              {/* Comment submission form */}
              <form
                onSubmit={(e) => handleAddComment(selectedPost._id, e)}
                className="card-comment-form"
              >
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={modalCommentText}
                  onChange={(e) => setModalCommentText(e.target.value)}
                  className="card-comment-input"
                />
                <button
                  type="submit"
                  disabled={!modalCommentText.trim()}
                  className="card-comment-submit-btn"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal (triggered from Navbar) */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create new post</span>
              <button
                className="modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
                title="Close"
                type="button"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="modal-body">
              {!createImage ? (
                <div className="file-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCreateImage(e.target.files[0])}
                    className="file-upload-input"
                    required
                  />
                  <FiImage className="upload-icon" />
                  <span className="upload-title">Select photos here</span>
                  <span className="upload-subtitle">JPG, PNG, GIF formats supported</span>
                  <button type="button" className="select-btn">Select from device</button>
                </div>
              ) : (
                <div className="image-preview-wrapper">
                  <img
                    src={URL.createObjectURL(createImage)}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    className="change-photo-btn"
                    onClick={() => setCreateImage(null)}
                    type="button"
                  >
                    <FiImage /> Change Photo
                  </button>
                </div>
              )}

              <div className="modal-form-inputs">
                <textarea
                  placeholder="Write a caption..."
                  value={createCaption}
                  onChange={(e) => setCreateCaption(e.target.value)}
                  className="modal-textarea"
                  maxLength={2200}
                />
              </div>

              <div className="modal-submit-container">
                <button
                  type="submit"
                  disabled={!createImage}
                  className="modal-submit-btn"
                >
                  Share Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;