// client/src/components/Chatbot/ChatTriggerButton.jsx
// Floating Action Trigger Button for Y-Library AI Assistant

import Icon from "../Icon";

export default function ChatTriggerButton({ onClick, isOpen, unreadCount = 0 }) {
  return (
    <button
      type="button"
      className={`steam-chatbot-fab ${isOpen ? "active" : ""}`}
      onClick={onClick}
      aria-label="Open Y-Library AI Assistant"
      title="Ask Y-Library AI Assistant"
    >
      <div className="steam-chatbot-fab-inner">
        <Icon name={isOpen ? "x" : "chat"} size={22} color="#ffffff" />
      </div>

      {!isOpen && (
        <>
          <span className="steam-chatbot-fab-pulse" />
          <span className="steam-chatbot-fab-tooltip">Ask AI Assistant</span>
        </>
      )}

      {unreadCount > 0 && !isOpen && (
        <span className="steam-chatbot-badge">{unreadCount}</span>
      )}
    </button>
  );
}
