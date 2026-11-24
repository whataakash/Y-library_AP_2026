import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import AuthModal from "./AuthModal";
import { GoogleLogo } from "./GoogleAccountChooserModal";

export default function Sidebar({ activeTab, setActiveTab, onSelectBook, onOpenChatbot }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const currentPath = location.pathname;

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

  // Dynamic user continue reading list
  const userContinueReading = user?.continueReading || [];

  const handleContinueClick = (item) => {
    if (onSelectBook && item.bookId) {
      onSelectBook(item.bookId);
    } else {
      navigate("/books");
    }
  };

  return (
    <>
      <aside className="steam-sidebar">
        <div>
          {/* Brand Inspired by Mockup */}
          <div
            className="steam-logo"
            onClick={() => navigate("/home")}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img
              src="/y-lib-logo.svg"
              alt="Y-Library"
              style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "contain" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "15px", fontWeight: "900", letterSpacing: "1px", color: "var(--steam-orange)" }}>
                Y—LIBRARY
              </span>
              <span style={{ fontSize: "10px", color: "var(--steam-muted)", fontWeight: "600", textTransform: "uppercase" }}>
                Campus Catalog
              </span>
            </div>
          </div>

          {/* Active Student Pill in Sidebar */}
          {isAuthenticated ? (
            <div
              onClick={() => setIsAuthOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "var(--steam-panel-hover)",
                border: "1px solid var(--steam-border)",
                cursor: "pointer",
                marginTop: "8px",
                transition: "all 0.2s",
              }}
              title="Click to switch student or account"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775?w=100&h=100&fit=crop"}
                alt={user?.name}
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--steam-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: "10px", color: "var(--steam-orange)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.major ? user.major.split("&")[0].trim() : "Student"}
                </div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--steam-muted)" }}>⇄</span>
            </div>
          ) : (
            <div
              onClick={() => setIsAuthOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "12px",
                background: "var(--steam-panel-hover)",
                border: "1px dashed var(--steam-border)",
                cursor: "pointer",
                marginTop: "8px",
                transition: "all 0.2s",
              }}
            >
              <GoogleLogo size={18} />
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--steam-text)" }}>
                Sign In with Google
              </div>
            </div>
          )}

          {/* Navigation List */}
          <nav className="steam-nav-list" style={{ marginTop: "18px" }}>
            {navItems.map((item) => {
              const isActive = currentPath === item.path || activeTab === item.id || (item.id === "home" && currentPath === "/");
              return (
                <button
                  key={item.id}
                  className={`steam-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => {
                    if (setActiveTab) setActiveTab(item.id);
                    navigate(item.path);
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={18}
                    color={isActive ? "var(--steam-orange)" : "var(--steam-muted)"}
                  />
                  <span>{item.label}</span>
                  {isActive && <div className="steam-active-dot" />}
                </button>
              );
            })}

            {/* AI Assistant Quick Launcher */}
            <button
              type="button"
              className="steam-nav-item"
              onClick={onOpenChatbot}
              style={{
                marginTop: "10px",
                background: "rgba(249, 92, 75, 0.1)",
                border: "1px solid rgba(249, 92, 75, 0.25)",
              }}
              title="Open Y-Library AI Assistant"
            >
              <Icon name="chat" size={18} color="var(--steam-orange)" />
              <span style={{ color: "var(--steam-orange)", fontWeight: "700" }}>AI Assistant</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "9px",
                  fontWeight: "800",
                  background: "var(--steam-orange)",
                  color: "#ffffff",
                  padding: "1px 6px",
                  borderRadius: "6px",
                  letterSpacing: "0.5px",
                }}
              >
                AI
              </span>
            </button>
          </nav>
        </div>

        {/* Middle & Bottom Sections: Personalized Continue Reading */}
        <div className="steam-sidebar-bottom">
          <div className="steam-continue-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--steam-muted)" }}>
                Continue Reading
              </span>
              <span style={{ fontSize: "10px", color: "var(--steam-orange)", fontWeight: "600" }}>
                {userContinueReading.length} in progress
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userContinueReading.length > 0 ? (
                userContinueReading.map((item) => (
                  <div
                    key={item.bookId || item.id}
                    className="steam-continue-item"
                    onClick={() => handleContinueClick(item)}
                    title={`Continue reading ${item.title}`}
                  >
                    <img
                      src={item.cover || "https://covers.openlibrary.org/b/id/1094406-L.jpg"}
                      alt={item.title}
                      className="steam-continue-thumb"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="steam-continue-title">{item.title}</div>
                      <div className="steam-continue-sub">{item.chapter}</div>
                      {/* Mini progress bar */}
                      <div
                        style={{
                          width: "100%",
                          height: "3px",
                          background: "var(--steam-border)",
                          borderRadius: "2px",
                          marginTop: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${item.progress || 20}%`,
                            height: "100%",
                            background: "var(--steam-orange)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="steam-continue-play">
                      <Icon name="play" size={10} color="#ffffff" />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "11px", color: "var(--steam-muted)", padding: "8px 0" }}>
                  {isAuthenticated
                    ? "No active books. Pick a book to begin reading!"
                    : "Sign in to track your reading progress."}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
