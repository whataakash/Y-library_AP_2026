// client/src/components/Chatbot/ChatMessage.jsx
// Renders individual conversation messages with Markdown-style formatting,
// code highlighting, action buttons, timestamps, and copy options.

import { useState } from "react";
import Icon from "../Icon";

/**
 * Lightweight helper to format bold text, bullet points, and inline code
 */
function renderFormattedContent(text = "") {
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Empty line creates spacing
    if (!line.trim()) {
      return <div key={lineIdx} style={{ height: "8px" }} />;
    }

    // Bullet point
    const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-");
    const cleanLine = isBullet ? line.trim().replace(/^[-•]\s*/, "") : line;

    // Tokenize inline code and bold
    const parts = [];
    let current = "";
    let i = 0;

    while (i < cleanLine.length) {
      // Inline code `code`
      if (cleanLine[i] === "`") {
        if (current) {
          parts.push(processBold(current));
          current = "";
        }
        const end = cleanLine.indexOf("`", i + 1);
        if (end !== -1) {
          const codeSnippet = cleanLine.substring(i + 1, end);
          parts.push(
            <code key={`code-${i}`} className="steam-chatbot-inline-code">
              {codeSnippet}
            </code>
          );
          i = end + 1;
          continue;
        }
      }
      current += cleanLine[i];
      i++;
    }

    if (current) {
      parts.push(processBold(current));
    }

    if (isBullet) {
      return (
        <div key={lineIdx} className="steam-chatbot-bullet-line">
          <span className="steam-chatbot-bullet-dot">•</span>
          <span className="steam-chatbot-bullet-text">{parts}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className="steam-chatbot-text-line">
        {parts}
      </div>
    );
  });
}

function processBold(text) {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${match.index}`} className="steam-chatbot-strong">
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}

export default function ChatMessage({ message, onSelectSuggestion, studentName = "Student" }) {
  const [copied, setCopied] = useState(false);
  const isBot = message.sender === "bot";

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`steam-chatbot-msg-wrapper ${isBot ? "bot" : "user"}`}>
      {/* Avatar */}
      <div className="steam-chatbot-avatar">
        {isBot ? (
          <div className="steam-chatbot-bot-avatar">
            <Icon name="chat" size={16} color="var(--steam-orange)" />
          </div>
        ) : (
          <div className="steam-chatbot-user-avatar">
            <span>{studentName.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div className="steam-chatbot-bubble-col">
        <div className="steam-chatbot-bubble-header">
          <span className="steam-chatbot-sender-name">
            {isBot ? "Y-Library AI" : studentName}
          </span>
          <span className="steam-chatbot-timestamp">{message.timestamp || "Just now"}</span>
          {isBot && message.source && (
            <span className="steam-chatbot-source-pill">
              {message.source === "backend" ? "Live API" : "Knowledge Base"}
            </span>
          )}
        </div>

        <div className="steam-chatbot-bubble-body">
          {renderFormattedContent(message.text)}
        </div>

        {/* Action Suggestions attached to message */}
        {isBot && message.suggestions && message.suggestions.length > 0 && (
          <div className="steam-chatbot-msg-suggestions">
            {message.suggestions.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                className="steam-chatbot-msg-suggestion-chip"
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
              >
                <span>{sug}</span>
                <Icon name="arrow-right" size={12} color="var(--steam-orange)" />
              </button>
            ))}
          </div>
        )}

        {/* Message Footer / Copy */}
        {isBot && (
          <div className="steam-chatbot-bubble-footer">
            <button
              type="button"
              className="steam-chatbot-copy-btn"
              onClick={handleCopy}
              title="Copy response"
            >
              <Icon name="clipboard" size={12} color="var(--steam-muted)" />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
