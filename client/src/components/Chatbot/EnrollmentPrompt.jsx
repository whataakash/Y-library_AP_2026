// client/src/components/Chatbot/EnrollmentPrompt.jsx
// Student Onboarding View for AI Chatbot
// Collects student's Full Name and University Enrollment ID before initiating chat session.

import { useState } from "react";
import Icon from "../Icon";

export default function EnrollmentPrompt({ onComplete, initialName = "", initialEnrollment = "" }) {
  const [name, setName] = useState(initialName);
  const [enrollmentId, setEnrollmentId] = useState(initialEnrollment);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedId = enrollmentId.trim().toUpperCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!trimmedId) {
      setError("Please enter your university enrollment ID (e.g. EN2024101).");
      return;
    }

    if (trimmedId.length < 3) {
      setError("Enrollment ID must be at least 3 characters long.");
      return;
    }

    setError("");
    onComplete({ name: trimmedName, enrollmentId: trimmedId });
  };

  return (
    <div className="steam-chatbot-enrollment">
      <div className="steam-chatbot-enrollment-card">
        <div className="steam-chatbot-avatar-badge">
          <div className="steam-chatbot-avatar-inner">
            <Icon name="chat" size={28} color="var(--steam-orange)" />
          </div>
          <span className="steam-chatbot-pulse-dot" />
        </div>

        <h3 className="steam-chatbot-enrollment-title">Welcome to Y-Library AI</h3>
        <p className="steam-chatbot-enrollment-subtitle">
          Please identify yourself with your student credentials to start your personalized session.
        </p>

        {error && <div className="steam-chatbot-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="steam-chatbot-form">
          <div className="steam-chatbot-field">
            <label className="steam-chatbot-label" htmlFor="student-name">
              Full Name
            </label>
            <div className="steam-chatbot-input-wrap">
              <span className="steam-chatbot-input-icon">
                <Icon name="user" size={16} color="var(--steam-muted)" />
              </span>
              <input
                id="student-name"
                type="text"
                className="steam-chatbot-input"
                placeholder="e.g. Alex Morgan or Aarav Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="steam-chatbot-field">
            <label className="steam-chatbot-label" htmlFor="student-enrollment">
              Enrollment ID / Roll No.
            </label>
            <div className="steam-chatbot-input-wrap">
              <span className="steam-chatbot-input-icon">
                <Icon name="clipboard" size={16} color="var(--steam-muted)" />
              </span>
              <input
                id="student-enrollment"
                type="text"
                className="steam-chatbot-input"
                placeholder="e.g. EN2024101 or 2026AP042"
                value={enrollmentId}
                onChange={(e) => {
                  setEnrollmentId(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>

          <button type="submit" className="steam-chatbot-submit-btn">
            <span>Start AI Consultation</span>
            <Icon name="arrow-right" size={16} color="#ffffff" />
          </button>
        </form>

        <div className="steam-chatbot-enrollment-footer">
          🔒 Your student details are used solely to personalize your library records & shelf guidance.
        </div>
      </div>
    </div>
  );
}
