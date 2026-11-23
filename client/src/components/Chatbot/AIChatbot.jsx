// client/src/components/Chatbot/AIChatbot.jsx
// Main Y-Library AI Assistant Component
// Handles enrollment verification, chat message lifecycle, streaming state,
// minimize/expand controls, and connection to the chatApi service.

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { chatApi } from "../../services/chatApi";
import EnrollmentPrompt from "./EnrollmentPrompt";
import ChatMessage from "./ChatMessage";
import SuggestedQueries from "./SuggestedQueries";
import Icon from "../Icon";

export default function AIChatbot({ isOpen, onClose }) {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(() => chatApi.getStoredStudent());
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChangeStudent, setShowChangeStudent] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-fill from authenticated user if not already set
  useEffect(() => {
    if (!studentInfo.isEnrolled && user?.name) {
      const derivedId = user.id ? `EN2024${String(user.id).padStart(3, "0")}` : "EN2024042";
      setStudentInfo((prev) => ({
        ...prev,
        name: prev.name || user.name,
        enrollmentId: prev.enrollmentId || derivedId,
      }));
    }
  }, [user, studentInfo.isEnrolled]);

  // Initial welcome greeting when enrolled
  useEffect(() => {
    if (studentInfo.isEnrolled && messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "bot",
          text: `Hello **${studentInfo.name}**! 👋 Welcome to **Y-Library AI** (Enrollment ID: \`${studentInfo.enrollmentId}\`).\n\nI am your campus library copilot. I can answer questions about:\n• ⏰ **Library operating hours & exam schedules**\n• 📋 **14-day borrowing policies, renewals, & return deadlines**\n• 🗺️ **Physical book shelf locations across campus wings**\n• 💾 **PostgreSQL database schema & Prisma ORM architecture**\n• 🎓 **Faculty presentation highlights and viva explanations**\n\nHow can I help you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestions: [
            "What are the library hours?",
            "What are the borrowing rules?",
            "Explain the database schema",
            "Where are Computer Science books?",
          ],
        },
      ]);
    }
  }, [studentInfo.isEnrolled, studentInfo.name, studentInfo.enrollmentId, messages.length]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Complete onboarding
  const handleEnrollComplete = ({ name, enrollmentId }) => {
    chatApi.saveStoredStudent(name, enrollmentId);
    setStudentInfo({ name, enrollmentId, isEnrolled: true });
    setShowChangeStudent(false);
  };

  // Switch student profile
  const handleResetStudent = () => {
    chatApi.clearStoredStudent();
    setStudentInfo({ name: "", enrollmentId: "", isEnrolled: false });
    setMessages([]);
    setShowChangeStudent(true);
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Append student message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(
        query,
        studentInfo.name || "Student",
        studentInfo.enrollmentId || "EN2024101"
      );

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.reply,
        suggestions: response.suggestions || [],
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "I encountered an issue processing your request. Please check if the Express backend server is running or try another question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`steam-chatbot-overlay ${isExpanded ? "expanded" : ""}`}>
      <div className="steam-chatbot-window">
        {/* Top Header */}
        <header className="steam-chatbot-header">
          <div className="steam-chatbot-header-left">
            <div className="steam-chatbot-header-avatar">
              <Icon name="chat" size={18} color="var(--steam-orange)" />
              <span className="steam-chatbot-status-online" />
            </div>
            <div className="steam-chatbot-header-info">
              <div className="steam-chatbot-title-row">
                <span className="steam-chatbot-header-title">Y-Library Assistant</span>
                <span className="steam-chatbot-ai-badge">AI 2026</span>
              </div>
              {studentInfo.isEnrolled && (
                <div className="steam-chatbot-header-student">
                  <span className="steam-chatbot-student-name">{studentInfo.name}</span>
                  <span className="steam-chatbot-student-id">({studentInfo.enrollmentId})</span>
                  <button
                    type="button"
                    className="steam-chatbot-switch-btn"
                    onClick={handleResetStudent}
                    title="Change student name / enrollment ID"
                  >
                    ⇄ Switch
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="steam-chatbot-header-controls">
            {/* Expand / Minimize */}
            <button
              type="button"
              className="steam-chatbot-ctrl-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse size" : "Expand size"}
            >
              <Icon name={isExpanded ? "minimize" : "maximize"} size={16} color="var(--steam-muted)" />
            </button>

            {/* Close */}
            <button
              type="button"
              className="steam-chatbot-ctrl-btn close"
              onClick={onClose}
              title="Close Chat"
            >
              <Icon name="x" size={16} color="var(--steam-muted)" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        {!studentInfo.isEnrolled || showChangeStudent ? (
          <div className="steam-chatbot-body enrollment-view">
            <EnrollmentPrompt
              onComplete={handleEnrollComplete}
              initialName={studentInfo.name || user?.name || ""}
              initialEnrollment={studentInfo.enrollmentId || ""}
            />
          </div>
        ) : (
          <div className="steam-chatbot-body">
            {/* Quick Inquiries Drawer */}
            <SuggestedQueries onSelectQuery={(q) => handleSendMessage(q)} />

            {/* Message Stream */}
            <div className="steam-chatbot-messages">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectSuggestion={(sug) => handleSendMessage(sug)}
                  studentName={studentInfo.name}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="steam-chatbot-msg-wrapper bot typing">
                  <div className="steam-chatbot-avatar">
                    <div className="steam-chatbot-bot-avatar">
                      <Icon name="chat" size={16} color="var(--steam-orange)" />
                    </div>
                  </div>
                  <div className="steam-chatbot-bubble-col">
                    <div className="steam-chatbot-typing-bubble">
                      <span className="steam-chatbot-dot" />
                      <span className="steam-chatbot-dot" />
                      <span className="steam-chatbot-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <footer className="steam-chatbot-input-bar">
              <div className="steam-chatbot-input-container">
                <input
                  type="text"
                  className="steam-chatbot-main-input"
                  placeholder="Ask about books, library timings, borrow rules, schema..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                />
                <button
                  type="button"
                  className="steam-chatbot-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  title="Send message (Enter)"
                >
                  <Icon name="arrow-right" size={16} color="#ffffff" />
                </button>
              </div>
              <div className="steam-chatbot-input-subtext">
                Press <strong>Enter</strong> to send • Answers powered by Y-Library Knowledge Base & PostgreSQL
              </div>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}
