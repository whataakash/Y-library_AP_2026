import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";
import AuthModal from "./AuthModal";
import { GoogleLogo } from "./GoogleAccountChooserModal";

export default function Sidebar({ activeTab, setActiveTab, onSelectBook }) {
  const { user, isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "books", label: "Explore", icon: "compass" },
    { id: "library", label: "Favorites & Loans", icon: "heart" },
    { id: "community", label: "Community", icon: "chat" },
    { id: "marketplace", label: "Marketplace", icon: "tag" },
    { id: "requests", label: "Requests", icon: "clipboard" },
  ];

  // Dynamic user continue reading list
  const userContinueReading = user?.continueReading || [];

  const handleContinueClick = (item) => {
    if (onSelectBook && item.bookId) {
      onSelectBook(item.bookId);
    } else {
      setActiveTab("books");
    }
  };

  return (
    <>
      <aside className="steam-sidebar">
        <div>
          {/* Brand Inspired by Mockup */}
          <div
            className="steam-logo"
            onClick={() => setActiveTab("home")}
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
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`steam-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveTab(item.id)}
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
                            background: "linear-gradient(90deg, #F95C4B, #FF7B6D)",
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
