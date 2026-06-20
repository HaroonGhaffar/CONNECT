import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiBookmark,
  FiMoreHorizontal,
  FiX,
  FiImage
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

// ─── Tiny reusable avatar bubble ─────────────────────────────────────────────
function AvatarBubble({ name, size = 38, bg }) {
  const letter = name ? name.charAt(0).toUpperCase() : "?";
  const colors = ["#3b82f6", "#f43f5e", "#8b5cf6", "#f59e0b", "#10b981"];
  const color = bg || colors[letter.charCodeAt(0) % colors.length];
  return (
    <div
      className="avatar-ring"
      style={{ width: size, height: size, padding: "2px" }}
    >
      <div
        className="avatar-inner"
        style={{ fontSize: size * 0.36, backgroundColor: color }}
      >
        {letter}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).id;
  } catch {
    return null;
  }
}

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const secs = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatPostDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Post Comments Modal ──────────────────────────────────────────────────────
function PostCommentsModal({ post, currentUserId, onClose, onLike, onComment }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Auto-scroll to bottom when comments update
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [post.comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onComment(post._id, text.trim());
    setText("");
    inputRef.current?.focus();
  };

  const isLiked = post.likes?.some((id) => String(id) === String(currentUserId));
  const likeCount = post.likes?.length || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="comments-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: post image ── */}
        <div className="comments-modal-image-pane">
          <img src={post.image} alt="Post" className="comments-modal-image" />
        </div>

        {/* ── Right: sidebar ── */}
        <div className="comments-modal-sidebar">
          {/* Header */}
          <div className="comments-modal-header">
            <div className="post-header-left">
              <AvatarBubble name={post.user?.name} size={34} />
              <span
                className="post-user-name"
                style={{ fontSize: "14px", marginLeft: "10px" }}
              >
                {post.user?.name || "Anonymous"}
              </span>
            </div>
            <button className="modal-close-btn" onClick={onClose} type="button">
              <FiX />
            </button>
          </div>

          {/* Scrollable comment thread */}
          <div className="comments-modal-body" ref={bodyRef}>
            {/* Caption treated as first post */}
            {post.caption && (
              <div className="comment-row">
                <div className="comment-row-avatar">
                  <AvatarBubble name={post.user?.name} size={34} />
                </div>
                <div className="comment-row-body">
                  <p className="comment-row-line">
                    <span className="comment-row-username">
                      {post.user?.name || "Anonymous"}
                    </span>
                    <span className="comment-row-text">{post.caption}</span>
                  </p>
                  <span className="comment-row-time">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {/* Divider between caption and comments */}
            {post.caption && post.comments?.length > 0 && (
              <div className="comments-divider" />
            )}

            {/* Comment list */}
            {post.comments?.length > 0 ? (
              post.comments.map((c, i) => (
                <div key={c._id || i} className="comment-row">
                  <div className="comment-row-avatar">
                    <AvatarBubble name={c.user?.name} size={32} />
                  </div>
                  <div className="comment-row-body">
                    <p className="comment-row-line">
                      <span className="comment-row-username">
                        {c.user?.name || "Anonymous"}
                      </span>
                      <span className="comment-row-text">{c.text}</span>
                    </p>
                    <span className="comment-row-time">
                      {formatTimeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              !post.caption && (
                <p className="no-comments-hint">
                  No comments yet. Be the first to comment!
                </p>
              )
            )}
          </div>

          {/* Actions + likes + date */}
          <div className="comments-modal-actions">
            <div className="comments-modal-actions-row">
              <div className="post-actions-left">
                <button
                  className={`action-btn btn-like ${isLiked ? "liked" : ""}`}
                  onClick={() => onLike(post._id)}
                  style={{ fontSize: "22px" }}
                >
                  {isLiked ? <FaHeart /> : <FiHeart />}
                </button>
                <button
                  className="action-btn"
                  style={{ fontSize: "22px" }}
                  onClick={() => inputRef.current?.focus()}
                >
                  <FiMessageCircle />
                </button>
                <button className="action-btn" style={{ fontSize: "22px" }}>
                  <FiSend />
                </button>
              </div>
              <button className="action-btn" style={{ fontSize: "22px" }}>
                <FiBookmark />
              </button>
            </div>
            {likeCount > 0 && (
              <div className="comments-modal-likes">
                {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
              </div>
            )}
            <div className="comments-modal-date">
              {formatPostDate(post.createdAt)}
            </div>
          </div>

          {/* Sticky comment input */}
          <form
            className="comments-modal-input-row"
            onSubmit={handleSubmit}
          >
            <AvatarBubble name={post.user?.name} size={28} />
            <textarea
              ref={inputRef}
              className="comments-modal-input"
              placeholder="Add a comment…"
              value={text}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="comments-modal-submit-btn"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Main Home Component ──────────────────────────────────────────────────────
function Home() {
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);

  // The post whose comments modal is open (null = closed)
  const [openCommentsPost, setOpenCommentsPost] = useState(null);

  const currentUserId = getUserIdFromToken();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Sync openCommentsPost with updated posts list so the modal stays live
  useEffect(() => {
    if (openCommentsPost) {
      const refreshed = posts.find((p) => p._id === openCommentsPost._id);
      if (refreshed) setOpenCommentsPost(refreshed);
    }
  }, [posts]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleLikeToggle = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(`/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.map((p) => (p._id === postId ? res.data : p)));
    } catch (error) {
      console.log(error);
    }
  };

  const handleBookmarkToggle = (postId) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleAddComment = async (postId, text) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        `/posts/${postId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? res.data : p)));
    } catch (error) {
      console.log(error);
      alert("Failed to submit comment");
    }
  };

  const createPost = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("caption", caption);

      await API.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setCaption("");
      setSelectedImage(null);
      setIsCreateModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const openComments = (post) => setOpenCommentsPost(post);
  const closeComments = () => setOpenCommentsPost(null);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar onCreatePostClick={() => setIsCreateModalOpen(true)} />

      <div className="feed-container">
        {/* Create Post Trigger Card */}
        <div className="create-post-trigger-card">
          <AvatarBubble name="C" size={34} bg="#f43f5e" />
          <button
            className="create-trigger-input"
            onClick={() => setIsCreateModalOpen(true)}
          >
            What's on your mind? Share a photo…
          </button>
          <button
            className="create-trigger-icon-btn"
            onClick={() => setIsCreateModalOpen(true)}
            title="Upload Photo"
          >
            <FiImage />
          </button>
        </div>

        {/* ── Feed posts ────────────────────────────────────────────── */}
        {posts.map((post) => {
          const isLiked = post.likes?.some(
            (id) => String(id) === String(currentUserId)
          );
          const isBookmarked = bookmarkedPosts.includes(post._id);
          const likeCount = post.likes?.length || 0;
          const comments = post.comments || [];

          // Show last 2 comments as preview on the card
          const previewComments = comments.slice(-2);

          return (
            <article className="post-card" key={post._id}>
              {/* Card header */}
              <div className="post-header">
                <div className="post-header-left">
                  <AvatarBubble name={post.user?.name} />
                  <div className="post-user-info">
                    <span className="post-user-name">
                      {post.user?.name || "Anonymous"}
                    </span>
                    <span className="post-dot-separator">•</span>
                    <span
                      className="post-time-ago"
                      title={formatPostDate(post.createdAt)}
                    >
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>
                <button className="post-more-btn" title="More options">
                  <FiMoreHorizontal />
                </button>
              </div>

              {/* Image — double-tap area (click to open comments on mobile) */}
              <div className="post-image-container">
                <img src={post.image} alt="post" className="post-image" />
              </div>

              {/* Action buttons */}
              <div className="post-actions-row">
                <div className="post-actions-left">
                  <button
                    onClick={() => handleLikeToggle(post._id)}
                    className={`action-btn btn-like ${isLiked ? "liked" : ""}`}
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    {isLiked ? <FaHeart /> : <FiHeart />}
                  </button>

                  {/* Comment icon → opens full comment modal */}
                  <button
                    className="action-btn"
                    title="Comment"
                    onClick={() => openComments(post)}
                  >
                    <FiMessageCircle />
                  </button>

                  <button className="action-btn" title="Share">
                    <FiSend />
                  </button>
                </div>
                <button
                  onClick={() => handleBookmarkToggle(post._id)}
                  className={`action-btn btn-bookmark ${isBookmarked ? "active" : ""}`}
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
                >
                  {isBookmarked ? <FaBookmark /> : <FiBookmark />}
                </button>
              </div>

              {/* Likes count */}
              {likeCount > 0 && (
                <div className="post-likes-count">
                  {likeCount.toLocaleString()}{" "}
                  {likeCount === 1 ? "like" : "likes"}
                </div>
              )}

              {/* Caption */}
              {post.caption && (
                <div className="post-caption-box">
                  <span className="post-caption-username">
                    {post.user?.name || "Anonymous"}
                  </span>
                  <span className="post-caption-text">{post.caption}</span>
                </div>
              )}

              {/* ── Instagram-style comment preview section ── */}
              <div className="post-comment-preview-section">
                {/* "View all X comments" link — only if there are comments */}
                {comments.length > 0 && (
                  <button
                    className="view-all-comments-btn"
                    onClick={() => openComments(post)}
                  >
                    {comments.length === 1
                      ? "View 1 comment"
                      : `View all ${comments.length} comments`}
                  </button>
                )}

                {/* Last 2 comment previews */}
                {previewComments.map((c, i) => (
                  <div key={c._id || i} className="post-comment-item">
                    <span className="post-comment-username">
                      {c.user?.name || "Anonymous"}
                    </span>
                    <span className="post-comment-text">{c.text}</span>
                  </div>
                ))}
              </div>

              {/* Date */}
              <div className="post-timestamp">{formatPostDate(post.createdAt)}</div>

              {/* Inline comment input on the card */}
              <div
                className="card-comment-form"
                style={{ cursor: "text" }}
                onClick={() => openComments(post)}
              >
                <AvatarBubble name="C" size={24} bg="#f43f5e" />
                <span
                  className="card-comment-input"
                  style={{
                    color: "var(--text-secondary)",
                    cursor: "text",
                    userSelect: "none",
                  }}
                >
                  Add a comment…
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Post Comments Modal ──────────────────────────────────────── */}
      {openCommentsPost && (
        <PostCommentsModal
          post={openCommentsPost}
          currentUserId={currentUserId}
          onClose={closeComments}
          onLike={handleLikeToggle}
          onComment={handleAddComment}
        />
      )}

      {/* ── Create Post Modal ────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="modal-content-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Create new post</span>
              <button
                className="modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
                type="button"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {!selectedImage ? (
                <div className="file-upload-zone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className="file-upload-input"
                  />
                  <FiImage className="upload-icon" />
                  <span className="upload-title">Select photos here</span>
                  <span className="upload-subtitle">
                    JPG, PNG, GIF formats supported
                  </span>
                  <button className="select-btn">Select from device</button>
                </div>
              ) : (
                <div className="image-preview-wrapper">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    className="change-photo-btn"
                    onClick={() => setSelectedImage(null)}
                    type="button"
                  >
                    <FiImage /> Change Photo
                  </button>
                </div>
              )}

              <div className="modal-form-inputs">
                <textarea
                  placeholder="Write a caption…"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="modal-textarea"
                  maxLength={2200}
                />
              </div>

              <div className="modal-submit-container">
                <button
                  onClick={createPost}
                  disabled={!selectedImage}
                  className="modal-submit-btn"
                >
                  Share Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;