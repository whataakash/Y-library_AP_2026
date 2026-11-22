import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";

const GENRES = ["All", "Fiction", "Nature", "Sci-Fi", "Art & Design", "Philosophy", "History"];

export default function Books({ onSelectBook, initialSearch = "" }) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    api.getBooks(query, selectedGenre).then(setBooks);
  }, [query, selectedGenre]);

  const handleLock = async (e, bookId) => {
    e.stopPropagation();
    try {
      await api.lockBookDigitally(bookId);
      alert("Book digitally locked for 24 hours! Reserved for you.");
      const updated = await api.getBooks(query, selectedGenre);
      setBooks(updated);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  return (
    <div>
      {/* Search Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px" }}>
          Find Books & Campus Shelves
        </h2>
        <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
          Check real-time availability, physical shelf locations, or lock copies digitally.
        </p>
      </div>

      {/* Genre Filter Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "600",
              background: selectedGenre === g ? "linear-gradient(135deg, #ff6200, #ff4500)" : "linear-gradient(180deg, #0d0d10 0%, #050507 100%)",
              color: selectedGenre === g ? "#ffffff" : "var(--steam-muted)",
              border: selectedGenre === g ? "1px solid var(--steam-orange)" : "1px solid var(--steam-border)",
              boxShadow: selectedGenre === g ? "0 4px 14px rgba(255, 98, 0, 0.35)" : "none",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid of Books */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {books.map((b) => (
          <div
            key={b.id}
            onClick={() => onSelectBook(b.id)}
            style={{
              background: "linear-gradient(180deg, #0c0c10 0%, #040406 100%)",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid var(--steam-border)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <div
              style={{
                height: "220px",
                backgroundImage: `url(${b.coverImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "rgba(0,0,0,0.75)",
                  backdropFilter: "blur(4px)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#f0a500",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Icon name="star" size={12} color="#f0a500" />
                <span>{b.rating}</span>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: b.copies > 0 ? "rgba(34, 197, 94, 0.85)" : "rgba(239, 68, 68, 0.85)",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {b.copies > 0 ? `${b.copies} Available` : "Waitlist"}
              </div>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontSize: "11px", color: "var(--steam-orange)", fontWeight: "700" }}>
                {b.genre}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: "700", margin: "4px 0" }}>{b.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted)" }}>{b.author}</p>

              {/* Physical Location */}
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#f0a500",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon name="pin" size={13} color="#f0a500" />
                <span>{b.location}</span>
              </div>

              {/* Digital Lock Button */}
              <button
                onClick={(e) => handleLock(e, b.id)}
                disabled={b.copies <= 0}
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: b.copies > 0 ? "rgba(255, 98, 0, 0.15)" : "#222",
                  color: b.copies > 0 ? "var(--steam-orange)" : "#777",
                  border: `1px solid ${b.copies > 0 ? "var(--steam-orange)" : "#333"}`,
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Icon name="lock" size={13} color={b.copies > 0 ? "var(--steam-orange)" : "#777"} />
                <span>{b.copies > 0 ? "Lock Book Digitally (24h)" : "Unavailable"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
