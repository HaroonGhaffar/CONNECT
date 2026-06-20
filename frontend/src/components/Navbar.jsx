import { Link } from "react-router-dom";
import { FiHome, FiUser, FiLogOut, FiPlusSquare, FiSearch } from "react-icons/fi";

function Navbar({ onCreatePostClick }) {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          connect
        </Link>

        <div className="navbar-menu">
          <Link to="/home" className="navbar-link" title="Home">
            <FiHome />
          </Link>

          <Link to="/search" className="navbar-link" title="Search">
            <FiSearch />
          </Link>

          <button
            onClick={onCreatePostClick}
            className="navbar-btn navbar-link"
            title="Create Post"
          >
            <FiPlusSquare />
          </button>

          <Link to="/profile" className="navbar-link" title="Profile">
            <FiUser />
          </Link>

          <button
            onClick={logout}
            className="navbar-btn navbar-link logout-btn"
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;