import { useState, useEffect, useRef, useCallback } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { FiSearch, FiX, FiUser } from "react-icons/fi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RECENT_KEY = "connect_recent_searches";

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecent(user) {
  const prev = getRecent().filter((u) => u._id !== user._id);
  const next = [user, ...prev].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function removeRecent(userId) {
  const next = getRecent().filter((u) => u._id !== userId);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

function clearAllRecent() {
  localStorage.removeItem(RECENT_KEY);
}

// ─── Avatar bubble ────────────────────────────────────────────────────────────
function Avatar({ name, src, size = 44 }) {
  const COLORS = ["#3b82f6", "#f43f5e", "#8b5cf6", "#f59e0b", "#10b981"];
  const letter = name ? name.charAt(0).toUpperCase() : "?";
  const bg = COLORS[letter.charCodeAt(0) % COLORS.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: "1px solid #dbdbdb",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-title)",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="search-result-row search-skeleton-row">
      <div className="search-skeleton-avatar" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="search-skeleton-line" style={{ width: "45%" }} />
        <div className="search-skeleton-line" style={{ width: "30%" }} />
      </div>
    </div>
  );
}

// ─── Single result / recent row ───────────────────────────────────────────────
function UserRow({ user, onSelect, onRemove, showRemove = false }) {
  return (
    <div
      className="search-result-row"
      onClick={() => onSelect(user)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(user)}
      role="button"
    >
      <Avatar name={user.name} src={user.profilePic} size={44} />
      <div className="search-result-info">
        <span className="search-result-name">{user.name}</span>
        <span className="search-result-meta">
          {user.followersCount != null
            ? `${user.followersCount} follower${user.followersCount !== 1 ? "s" : ""}`
            : ""}
          {user.bio ? ` · ${user.bio.slice(0, 40)}${user.bio.length > 40 ? "…" : ""}` : ""}
        </span>
      </div>
      {showRemove && (
        <button
          className="search-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(user._id);
          }}
          title="Remove"
          type="button"
        >
          <FiX />
        </button>
      )}
    </div>
  );
}

// ─── Main Search Page ─────────────────────────────────────────────────────────
function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recent, setRecent] = useState(getRecent());

  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  // Auto-focus the search bar on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await API.get(`/users/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => doSearch(val), 300);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleSelectUser = (user) => {
    saveRecent(user);
    setRecent(getRecent());
    // In a fuller app, this would navigate to a public profile page.
    // For now, show a quick confirmation and keep the user on the search page.
    alert(`Viewing profile: ${user.name}`);
  };

  const handleRemoveRecent = (userId) => {
    removeRecent(userId);
    setRecent(getRecent());
  };

  const handleClearAll = () => {
    clearAllRecent();
    setRecent([]);
  };

  const showRecent = !query && recent.length > 0;
  const showEmpty = hasSearched && !isLoading && results.length === 0;

  return (
    <>
      <Navbar />

      <div className="search-page-container">
        {/* ── Search Bar ── */}
        <div className="search-bar-wrapper">
          <div className="search-bar-inner">
            <FiSearch className="search-bar-icon" />
            <input
              ref={inputRef}
              type="text"
              className="search-bar-input"
              placeholder="Search"
              value={query}
              onChange={handleQueryChange}
              autoComplete="off"
            />
            {query && (
              <button
                className="search-bar-clear-btn"
                onClick={handleClear}
                type="button"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* ── Results Panel ── */}
        <div className="search-results-panel">
          {/* Loading skeletons */}
          {isLoading && (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {/* Search results */}
          {!isLoading && hasSearched && results.length > 0 && (
            results.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onSelect={handleSelectUser}
              />
            ))
          )}

          {/* Empty results */}
          {showEmpty && (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <FiUser />
              </div>
              <p className="search-empty-title">No results found</p>
              <p className="search-empty-subtitle">
                Try searching by a different name.
              </p>
            </div>
          )}

          {/* Recent searches (shown when input is empty) */}
          {showRecent && (
            <>
              <div className="search-section-header">
                <span className="search-section-label">Recent</span>
                <button
                  className="search-clear-all-btn"
                  onClick={handleClearAll}
                  type="button"
                >
                  Clear all
                </button>
              </div>
              {recent.map((user) => (
                <UserRow
                  key={user._id}
                  user={user}
                  onSelect={handleSelectUser}
                  onRemove={handleRemoveRecent}
                  showRemove
                />
              ))}
            </>
          )}

          {/* Default empty state (no query, no recent) */}
          {!query && recent.length === 0 && (
            <div className="search-empty-state">
              <div className="search-empty-icon">
                <FiSearch />
              </div>
              <p className="search-empty-title">Search people</p>
              <p className="search-empty-subtitle">
                Find accounts you're interested in on Connect.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Search;
