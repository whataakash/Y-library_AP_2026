// client/src/services/chatApi.js
// Client API service for interacting with the AI Chatbot backend
// Includes automatic resilient fallback to local knowledge base if backend is offline.

import { BACKEND_URL } from "./api";
import { generateClientAnswer } from "../data/libraryKnowledge";

const STORAGE_KEY_NAME = "ylib_chat_student_name";
const STORAGE_KEY_ENROLLMENT = "ylib_chat_student_enrollment";

export const chatApi = {
  /**
   * Get cached student details from browser storage
   */
  getStoredStudent() {
    try {
      const name = localStorage.getItem(STORAGE_KEY_NAME) || "";
      const enrollmentId = localStorage.getItem(STORAGE_KEY_ENROLLMENT) || "";
      return { name, enrollmentId, isEnrolled: Boolean(name && enrollmentId) };
    } catch (e) {
      return { name: "", enrollmentId: "", isEnrolled: false };
    }
  },

  /**
   * Save student details for future chat sessions
   */
  saveStoredStudent(name, enrollmentId) {
    try {
      localStorage.setItem(STORAGE_KEY_NAME, name.trim());
      localStorage.setItem(STORAGE_KEY_ENROLLMENT, enrollmentId.trim().toUpperCase());
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Clear student onboarding session
   */
  clearStoredStudent() {
    try {
      localStorage.removeItem(STORAGE_KEY_NAME);
      localStorage.removeItem(STORAGE_KEY_ENROLLMENT);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Sends a message to the AI Chatbot backend with fallback support
   */
  async sendMessage(message, studentName, enrollmentId) {
    if (!message || !message.trim()) {
      throw new Error("Message cannot be empty.");
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${BACKEND_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          studentName,
          enrollmentId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return {
            reply: json.data.reply,
            suggestions: json.data.suggestions || [],
            source: "backend",
          };
        }
      }
    } catch (err) {
      console.warn("Backend chat unavailable, using client knowledge base:", err.message);
    }

    // Resilient offline fallback
    const fallbackAnswer = generateClientAnswer(message, studentName, enrollmentId);
    return {
      reply: fallbackAnswer.text,
      suggestions: fallbackAnswer.suggestions || [],
      source: "client-fallback",
    };
  },

  /**
   * Fetches FAQs from backend or returns null for local fallback
   */
  async getFaq() {
    try {
      const response = await fetch(`${BACKEND_URL}/chat/faq`);
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    } catch (e) {
      // Graceful silence for offline demo
    }
    return null;
  },
};
