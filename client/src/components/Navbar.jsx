import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icon";
import AuthModal from "./AuthModal";
import UserSwitcherModal from "./UserSwitcherModal";
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
  onSelectBook,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isContinueOpen, setIsContinueOpen] = useState(false);

  const profileRef = useRef(null);
  const continueRef = useRef(null);

  const currentPath = location.pathname;

  // Navigation Items matching the original sidebar
  const navItems = [
    { id: "home", path: "/home", label: "Home", icon: "home" },
    { id: "books", path: "/books", label: "Explore", icon: "compass" },
    { id: "library", path: "/library", label: "Favorites & Loans", icon: "heart" },
    { id: "community", path: "/community", label: "Community", icon: "chat" },
    { id: "marketplace", path: "/marketplace", label: "Marketplace", icon: "tag" },
    { id: "requests", path: "/requests", label: "Requests", icon: "clipboard" },
    ...(user?.role === "admin" || user?.role === "librarian"
      ? [{ id: "admin", path: "/admin", label: "Admin Portal", icon: "lock" }]
      : []),
  ];

  const userContinueReading = user?.continueReading || [];

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (continueRef.current && !continueRef.current.contains(e.target)) {
        setIsContinueOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global '/' keyboard shortcut for search
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
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  const handleCategoryClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (setActiveTab) setActiveTab("books");
    navigate("/books");
  };

  const handleNavClick = (item) => {
    if (setActiveTab) setActiveTab(item.id);
    navigate(item.path);
  };

  const handleContinueClick = (item) => {
    setIsContinueOpen(false);
    if (onSelectBook && (item.bookId || item.id)) {
      onSelectBook(item.bookId || item.id);
    } else {
      navigate("/books");
    }
  };

  const isItemActive = (item) => {
    if (item.path === "/home" && (currentPath === "/home" || currentPath === "/")) return true;
    if (item.path === "/books" && (currentPath === "/books" || currentPath.startsWith("/books/"))) return true;
    return currentPath === item.path;
  };

  return (
    <>
      <header className="steam-topbar-wrapper">
        {/* Main Top Navigation Row */}
        <div className="steam-topbar-main">
          {/* 1. Left: Brand Logo & Title */}
          <div
            className="steam-top-brand"
            onClick={() => navigate("/home")}
            title="Y-Library Campus Catalog"
          >
            <img
              src="/y-lib-logo.svg"
              alt="Y-Library"
              className="steam-brand-img"
            />
            <div className="steam-brand-text">
              <span className="steam-brand-title">Y—LIBRARY</span>
              <span className="steam-brand-subtitle">CAMPUS CATALOG</span>
            </div>
          </div>

          {/* 2. Middle-Left: Top Navigation Buttons */}
          <nav className="steam-top-nav-list" aria-label="Main Navigation">
            {navItems.map((item) => {
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`steam-top-nav-btn ${active ? "active" : ""}`}
                  onClick={() => handleNavClick(item)}
                  title={item.label}
                >
                  <Icon
                    name={item.icon}
                    size={15}
                    color={active ? "var(--steam-orange)" : "var(--steam-muted)"}
                  />
                  <span>{item.label}</span>
                  {active && <span className="steam-top-nav-active-bar" />}
                </button>
              );
            })}
          </nav>

          {/* 3. Middle-Right: Search Input */}
          <div className="steam-top-search-wrap">
            <span className="steam-search-icon">
              <Icon name="search" size={14} color="var(--steam-muted)" />
            </span>
            <input
              type="text"
              className="steam-top-search-input search-input"
              placeholder="Search 900+ books, authors, ISBN... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 4. Far Right: Actions, AI Button & User Card */}
          <div className="steam-topbar-actions">
            {/* AI Assistant Button */}
            <button
              type="button"
              className="steam-top-ai-btn"
              onClick={onOpenChatbot}
              title="Open AI Library Assistant"
            >
              <Icon name="chat" size={15} color="var(--steam-orange)" />
              <span className="ai-btn-text">AI Assistant</span>
              <span className="ai-pill-tag">AI</span>
            </button>

            {/* Continue Reading Dropdown */}
            {userContinueReading.length > 0 && (
              <div className="steam-top-continue-wrap" ref={continueRef}>
                <button
                  type="button"
                  className={`steam-top-continue-trigger ${isContinueOpen ? "open" : ""}`}
                  onClick={() => setIsContinueOpen(!isContinueOpen)}
                  title="Continue Reading"
                >
                  <Icon name="play" size={12} color="var(--steam-orange)" />
                  <span className="continue-label">Reading</span>
                  <span className="continue-badge">{userContinueReading.length}</span>
                </button>

                {isContinueOpen && (
                  <div className="steam-continue-popover">
                    <div className="continue-popover-header">
                      <span>Continue Reading</span>
                      <span className="continue-count-label">{userContinueReading.length} in progress</span>
                    </div>
                    <div className="continue-popover-list">
                      {userContinueReading.map((item) => (
                        <div
                          key={item.bookId || item.id}
                          className="steam-continue-popover-item"
                          onClick={() => handleContinueClick(item)}
                        >
                          <img
                            src={item.cover || "https://covers.openlibrary.org/b/id/1094406-L.jpg"}
                            alt={item.title}
                            className="continue-item-thumb"
                          />
                          <div className="continue-item-details">
                            <div className="continue-item-title">{item.title}</div>
                            <div className="continue-item-sub">{item.chapter}</div>
                            <div className="continue-item-bar-bg">
                              <div
                                className="continue-item-bar-fill"
                                style={{ width: `${item.progress || 35}%` }}
                              />
                            </div>
                          </div>
                          <div className="continue-item-play">
                            <Icon name="play" size={10} color="#ffffff" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              className="steam-top-icon-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <Icon
                name={isDark ? "sun" : "moon"}
                size={15}
                color={isDark ? "var(--color-stone)" : "var(--color-coral)"}
              />
            </button>

            {/* Campus Notification Bell */}
            <button
              type="button"
              className="steam-top-icon-btn"
              title="Notifications"
              onClick={() =>
                alert(
                  isAuthenticated
                    ? `Campus Alert for ${user?.name}: 2 books reserved on Central Library shelves.`
                    : "Please sign in to check campus library holds."
                )
              }
            >
              <Icon name="bell" size={15} color="var(--steam-text)" />
              <span className="steam-badge-dot" />
            </button>

            {/* User Profile / Switcher Pill */}
            {isAuthenticated ? (
              <div className="steam-top-user-wrap" ref={profileRef}>
                <div
                  className="steam-top-user-pill"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  title="Click for Profile & Switch User"
                >
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775?w=100&h=100&fit=crop"
                    }
                    alt={user?.name}
                    className="steam-top-user-avatar"
                  />
                  <div className="steam-top-user-meta">
                    <div className="steam-top-user-name">{user?.name}</div>
                    <div className="steam-top-user-role">
                      {user?.role === "admin"
                        ? "Admin"
                        : user?.role === "librarian"
                        ? "Librarian"
                        : user?.major
                        ? user.major.split("&")[0].trim()
                        : "Student"}
                    </div>
                  </div>
                  <span className="steam-top-user-switch-icon" title="Switch User">⇄</span>
                </div>

                {/* Profile & Switcher Dropdown */}
                {isProfileMenuOpen && (
                  <div className="steam-top-profile-menu">
                    <div className="profile-menu-user-header">
                      <div className="profile-menu-name">{user?.name}</div>
                      <div className="profile-menu-email">{user?.email}</div>
                      <div className="profile-menu-badge">
                        Role: <strong>{user?.role?.toUpperCase() || "STUDENT"}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="profile-menu-action"
                      onClick={() => {
                        setIsSwitcherOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>⇄</span>
                      <span>Switch Demo Account (9 Roles)</span>
                    </button>

                    <button
                      type="button"
                      className="profile-menu-action"
                      onClick={() => {
                        if (setActiveTab) setActiveTab("library");
                        navigate("/library");
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <Icon name="heart" size={14} color="var(--steam-orange)" />
                      <span>My Favorites & Loans</span>
                    </button>

                    {user?.role === "admin" && (
                      <button
                        type="button"
                        className="profile-menu-action"
                        onClick={() => {
                          if (setActiveTab) setActiveTab("admin");
                          navigate("/admin");
                          setIsProfileMenuOpen(false);
                        }}
                      >
                        <Icon name="lock" size={14} color="var(--steam-orange)" />
                        <span>Admin Management Portal</span>
                      </button>
                    )}

                    <div className="profile-menu-divider" />

                    <button
                      type="button"
                      className="profile-menu-action danger"
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                        navigate("/");
                      }}
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="steam-top-signin-btn"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <GoogleLogo size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Category Sub-Bar (Visible ONLY under Explore) */}
        {currentPath === "/books" && (
          <div className="steam-topbar-subcategories">
            <div className="steam-subcat-scroll">
              <span className="steam-subcat-label">Genres:</span>
              {QUICK_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`steam-subcat-pill ${isActive ? "active" : ""}`}
                    onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Account Switcher Modal (Allows testing any of the 9 roles seamlessly) */}
      <UserSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
