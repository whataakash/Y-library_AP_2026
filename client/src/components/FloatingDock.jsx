import Icon from "./Icon";

// Modern Floating Dock inspired by the mockup
export default function FloatingDock({ activeTab, setActiveTab }) {
  const dockItems = [
    { id: "home", icon: "home", label: "Home" },
    { id: "library", icon: "heart", label: "Favorites" },
    { id: "books", icon: "compass", label: "Explore" },
    { id: "community", icon: "chat", label: "Community" },
    { id: "requests", icon: "bell", label: "Alerts" },
  ];

  return (
    <nav className="steam-floating-dock" aria-label="Quick Navigation">
      {dockItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`steam-dock-item ${isActive ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <Icon
              name={item.icon}
              size={18}
              color={isActive ? "#ffffff" : "var(--steam-muted)"}
            />
          </button>
        );
      })}
    </nav>
  );
}
