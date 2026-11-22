import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();

  const navItems = [
    { id: "home", label: "Store", icon: "store" },
    { id: "books", label: "Find Books", icon: "search" },
    { id: "library", label: "My Library", icon: "library" },
    { id: "community", label: "Community", icon: "community" },
    { id: "marketplace", label: "Marketplace", icon: "tag" },
    { id: "requests", label: "Requests", icon: "clipboard" },
  ];

  return (
    <aside className="steam-sidebar">
      <div>
        {/* Steam-Style Logo */}
        <div className="steam-logo" onClick={() => setActiveTab("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/y-lib-logo.svg"
            alt="Y-Library Logo"
            style={{ width: "32px", height: "32px", borderRadius: "8px", objectFit: "contain" }}
          />
          <span>Y—LIBRARY</span>
        </div>

        {/* Navigation List */}
        <nav className="steam-nav-list">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`steam-nav-item ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                {isActive && <div className="steam-nav-indicator" />}
                <Icon name={item.icon} size={18} color={isActive ? "#fff" : "var(--steam-muted)"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="steam-sidebar-bottom">
        <div className="steam-nav-list">
          <button
            className={`steam-nav-item ${activeTab === "library" ? "active" : ""}`}
            onClick={() => setActiveTab("library")}
          >
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </button>
          <button
            className="steam-nav-item"
            onClick={() => alert("Campus Library Helpdesk: Visit East Library Level 1 or email library@y-university.edu")}
          >
            <Icon name="help" size={18} />
            <span>Help</span>
          </button>
        </div>

        {/* Steam Friends Chat Box */}
        <div
          className="steam-chat-pill"
          onClick={() => setActiveTab("community")}
          title="Campus reading partners & study groups"
        >
          <div>
            <b>Campus Circle</b>
            <div style={{ fontSize: "11px", color: "var(--steam-orange)" }}>
              4 active readers
            </div>
          </div>
          <Icon name="plus" size={16} />
        </div>
      </div>
    </aside>
  );
}
