import { useState, useEffect } from "react";
import Icon from "./Icon";

// Modern Floating Dock inspired by the mockup
export default function FloatingDock({ activeTab, setActiveTab, onOpenChatbot }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      {/* Direct AI Assistant Dock Trigger */}
      {onOpenChatbot && (
        <button
          type="button"
          className="steam-dock-item"
          onClick={onOpenChatbot}
          title="Ask AI Assistant"
          style={{
            background: "rgba(249, 92, 75, 0.2)",
            border: "1px solid rgba(249, 92, 75, 0.4)",
          }}
        >
          <Icon name="chat" size={18} color="var(--steam-orange)" />
        </button>
      )}

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          type="button"
          className="steam-dock-item scroll-to-top-btn scroll-to-top"
          onClick={scrollToTop}
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <Icon name="chevronUp" size={18} />
        </button>
      )}
    </nav>
  );
}
