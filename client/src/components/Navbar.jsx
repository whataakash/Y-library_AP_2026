import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function Navbar({ searchQuery, setSearchQuery, onSearchSubmit, setActiveTab }) {
  const { user } = useAuth();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <header className="steam-header">
      {/* Mobile Logo Brand */}
      <div className="steam-mobile-logo" onClick={() => setActiveTab("home")}>
        <img
          src="/y-lib-logo.svg"
          alt="Y-Library"
          style={{ width: "28px", height: "28px", borderRadius: "6px", objectFit: "contain" }}
        />
        <span>Y—LIBRARY</span>
      </div>

      {/* Pill Search Bar */}
      <div className="steam-search-wrap">
        <span className="steam-search-icon">
          <Icon name="search" size={16} color="var(--steam-muted)" />
        </span>
        <input
          type="text"
          className="steam-search-input"
          placeholder="Search books, authors, physical locations, ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Header Actions */}
      <div className="steam-header-actions">
        {/* Notification Bell */}
        <button
          className="steam-icon-btn"
          title="Notifications"
          onClick={() => alert("Campus Alert: 'The Secret History' reserve hold active for 24 hours.")}
        >
          <Icon name="bell" size={17} />
          <span className="steam-badge-dot" />
        </button>

        {/* Readlist / Cart Icon */}
        <button
          className="steam-icon-btn"
          title="My Readlists & Saved Books"
          onClick={() => setActiveTab("library")}
        >
          <Icon name="bookmark" size={17} />
        </button>

        {/* User Profile Pill */}
        <div
          className="steam-user-profile"
          onClick={() => setActiveTab("library")}
          title="Click to view profile & curated books"
        >
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"}
            alt={user?.name || "User"}
            className="steam-user-avatar"
          />
          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            {user?.name || "Jenny Wilson"}
          </span>
          <Icon name="chevronDown" size={13} color="var(--steam-muted)" />
        </div>
      </div>
    </header>
  );
}
