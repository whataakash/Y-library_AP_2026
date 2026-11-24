import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";
import BookTile from "../components/BookTile";

const GENRES = [
  "All",
  "Technology",
  "Science Fiction",
  "Fantasy",
  "Philosophy",
  "Psychology",
  "Economics",
  "Mystery",
  "Classics",
  "History",
  "Science",
  "Business",
  "Biography",
  "Young Adult",
];

export default function Books({
  onSelectBook,
  initialSearch = "",
  selectedCategory = "All",
  onSelectCategory,
}) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState(initialSearch);
  const activeGenre = selectedCategory || "All";

  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    api.getBooks(query, activeGenre).then(setBooks);
  }, [query, activeGenre]);

  const handleLock = async (e, bookId) => {
    e.stopPropagation();
    try {
      await api.lockBookDigitally(bookId);
      alert("Book digitally locked for 24 hours! Reserved for you.");
      const updated = await api.getBooks(query, activeGenre);
      setBooks(updated);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  const handleGenreClick = (genre) => {
    if (onSelectCategory) {
      onSelectCategory(genre);
    }
  };

  return (
    <div>
      {/* Search Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px", color: "var(--steam-text)" }}>
          Find Books & Campus Shelves
        </h2>
        <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
          Check real-time availability, physical shelf locations, or lock copies digitally.
        </p>
      </div>

      {/* Genre Filter Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {GENRES.map((g) => {
          const isSelected = activeGenre === g;
          return (
            <button
              key={g}
              onClick={() => handleGenreClick(g)}
              className={`steam-cat-pill ${isSelected ? "active" : ""}`}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "600",
                background: isSelected
                  ? "var(--steam-orange)"
                  : "var(--steam-input-bg)",
                color: isSelected ? "#F6F4F1" : "var(--steam-muted)",
                border: isSelected
                  ? "1px solid var(--steam-orange)"
                  : "1px solid var(--steam-border)",
                boxShadow: isSelected
                  ? "0 4px 14px rgba(249, 92, 75, 0.35)"
                  : "none",
              }}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Grid of Books with Kindle-Inspired 1:1.5 Aspect Ratio */}
      <div className="book-grid-aspect">
        {books.map((b) => (
          <BookTile
            key={b.id || b.isbn}
            book={b}
            onSelect={onSelectBook}
            onLock={handleLock}
            showAction={true}
          />
        ))}
      </div>
    </div>
  );
}
