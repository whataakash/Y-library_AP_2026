// client/src/components/Chatbot/SuggestedQueries.jsx
// Quick Suggestion Chips and Categorized Project Prompt Selector

import { useState } from "react";
import Icon from "../Icon";
import { LIBRARY_INFO } from "../../data/libraryKnowledge";

export default function SuggestedQueries({ onSelectQuery }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const categories = LIBRARY_INFO.suggestedCategories || [];
  const currentCategory = categories[activeCategoryIndex] || categories[0];

  return (
    <div className="steam-chatbot-suggested-section">
      <div className="steam-chatbot-suggested-header">
        <span className="steam-chatbot-suggested-title">
          <Icon name="compass" size={14} color="var(--steam-orange)" />
          <span>Quick Inquiries</span>
        </span>

        {/* Category Pill Buttons */}
        <div className="steam-chatbot-cat-pill-row">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              className={`steam-chatbot-cat-pill ${activeCategoryIndex === idx ? "active" : ""}`}
              onClick={() => setActiveCategoryIndex(idx)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="steam-chatbot-chip-grid">
        {currentCategory?.queries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className="steam-chatbot-query-chip"
            onClick={() => onSelectQuery(q)}
          >
            <span>{q}</span>
            <span className="steam-chatbot-chip-arrow">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
