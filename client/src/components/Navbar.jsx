import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";
import AuthModal from "./AuthModal";
import { GoogleLogo } from "./GoogleAccountChooserModal";

const QUICK_CATEGORIES = [
  "All",
  "Technology",
  "Science Fiction",
  "Fantasy",
  "Philosophy",
  "Psychology",
  "History",
];

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  setActiveTab,
  activeCategory = "All",
  onSelectCategory,
  onOpenChatbot,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "/") {
        const targetTag = e.target?.tagName?.toLowerCase();
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        const isTyping =
          targetTag === "input" ||
          targetTag === "textarea" ||
          targetTag === "select" ||
          e.target?.isContentEditable ||
          activeTag === "input" ||
          activeTag === "textarea" ||
          activeTag === "select" ||
          document.activeElement?.isContentEditable;

        if (!isTyping) {
          e.preventDefault();
          document.querySelector(".search-input")?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  const handleCategoryClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setActiveTab("books");
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <header className="steam-header">
        {/* Pill Search Bar */}
        <div className="steam-search-wrap">
          <span className="steam-search-icon">
            <Icon name="search" size={16} color="var(--steam-muted)" />
          </span>
          <input
            type="text"
            className="steam-search-input search-input"
            placeholder="Search 900+ books, bestsellers, authors, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Category Pills (Inspired by mockup) */}
        <div className="steam-header-categories">
          {QUICK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                className={`steam-cat-pill ${isActive ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Header Actions */}
        <div className="steam-header-actions" style={{ position: "relative" }}>
          {/* Dark / Light Mode Toggle */}
          <button
            className="steam-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            <div className="steam-theme-toggle-track">
              <Icon
                name={isDark ? "sun" : "moon"}
                size={16}
                color={isDark ? "var(--color-stone)" : "var(--color-coral)"}
              />
            </div>
          </button>

          {/* AI Assistant Pill Button */}
          <button
            className="steam-icon-btn"
            title="Ask Y-Library AI Assistant"
            onClick={onOpenChatbot}
            style={{
              background: "rgba(249, 92, 75, 0.12)",
              border: "1px solid rgba(249, 92, 75, 0.3)",
              color: "var(--steam-orange)",
            }}
          >
            <Icon name="chat" size={17} color="var(--steam-orange)" />
            <span className="steam-badge-dot" style={{ background: "var(--steam-orange)" }} />
          </button>

          {/* Notification Bell */}
          <button
            className="steam-icon-btn"
            title="Notifications"
            onClick={() =>
              alert(
                isAuthenticated
                  ? `Campus Alert for ${user?.name}: 2 books reserved on Central Library shelves.`
                  : "Please sign in to check campus library holds."
              )
            }
          >
            <Icon name="bell" size={17} />
            <span className="steam-badge-dot" />
          </button>

          {/* Authenticated User Profile Pill or Sign-In Button */}
          {isAuthenticated ? (
            <div style={{ position: "relative" }}>
              <div
                className="steam-user-profile"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                title="Account & Session Settings"
              >
                <img
                  src={
                    user?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  }
                  alt={user?.name || "Student"}
                  className="steam-user-avatar"
                />
                <span className="steam-user-name">
                  {user?.name || "Student"}
                </span>
                <Icon name="chevronDown" size={13} color="var(--steam-muted)" />
              </div>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "48px",
                    width: "240px",
                    background: "var(--steam-panel)",
                    border: "1px solid var(--steam-border)",
                    borderRadius: "14px",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                    padding: "14px",
                    zIndex: 100,
                  }}
                >
                  <div style={{ paddingBottom: "10px", borderBottom: "1px solid var(--steam-border)", marginBottom: "10px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--steam-text)" }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--steam-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--steam-orange)", fontWeight: "600", marginTop: "4px" }}>
                      {user?.major}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("library");
                      setIsProfileDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "var(--steam-text)",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--steam-panel-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <Icon name="heart" size={15} color="var(--steam-orange)" />
                    <span>My Reading & Loans</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsProfileDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "var(--steam-text)",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--steam-panel-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <GoogleLogo size={15} />
                    <span>Switch / Add Account</span>
                  </button>

                  <div style={{ borderTop: "1px solid var(--steam-border)", margin: "8px 0" }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#ef4444",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "#ffffff",
                color: "#1f2937",
                fontSize: "13px",
                fontWeight: "700",
                border: "1px solid #dadce0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
            >
              <GoogleLogo size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Authentication Modal (Credentials + Google Sign-In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
