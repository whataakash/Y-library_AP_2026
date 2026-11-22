import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  getPersonalizedRecommendations,
  getMajorSpecificBooks,
  getRecommendationReason,
} from "../services/personalization";
import Icon from "../components/Icon";
import BookTile from "../components/BookTile";

export default function Home({ onSelectBook, setActiveTab }) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lockStatus, setLockStatus] = useState("");

  useEffect(() => {
    api.getBooks().then((data) => {
      setBooks(data);
    });
  }, []);

  // Compute personalized recommendations based on active student
  const personalizedBooks = getPersonalizedRecommendations(user, books, 14);
  const majorBooks = getMajorSpecificBooks(user, books, 12);
  const userContinueReading = user?.continueReading || [];

  // Top featured book tailored to user's highest recommendation
  const heroCandidates = personalizedBooks.length > 0 ? personalizedBooks : books;
  const featuredBook = heroCandidates[currentIndex] || heroCandidates[0] || books[0];

  const scrollShelf = (id, direction = "right") => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollBy({ left: direction === "right" ? 380 : -380, behavior: "smooth" });
    }
  };

  const handlePrevHero = () => {
    const maxIdx = Math.min(heroCandidates.length - 1, 4);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIdx));
  };

  const handleNextHero = () => {
    const maxIdx = Math.min(heroCandidates.length - 1, 4);
    setCurrentIndex((prev) => (prev < maxIdx ? prev + 1 : 0));
  };

  const handleLockDigitally = async () => {
    if (!featuredBook) return;
    try {
      await api.lockBookDigitally(featuredBook.id, user?.name);
      setLockStatus(`Locked for 24h under ${user?.name}!`);
      const updated = await api.getBooks();
      setBooks(updated);
      setTimeout(() => setLockStatus(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  if (!featuredBook) {
    return <div style={{ padding: "40px", color: "var(--steam-muted)" }}>Loading personalized campus catalog...</div>;
  }

  const recommendationReason = getRecommendationReason(user, featuredBook);

  return (
    <div>
      {/* Personalized Welcome Banner Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
          padding: "10px 18px",
          borderRadius: "14px",
          background: "var(--steam-panel)",
          border: "1px solid var(--steam-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>👋</span>
          <div>
            <span style={{ fontWeight: "700", color: "var(--steam-text)", fontSize: "14px" }}>
              Welcome back, {user?.name}!
            </span>
            <span style={{ color: "var(--steam-muted)", fontSize: "12px", marginLeft: "8px" }}>
              Personalized catalog for {user?.major} ({user?.year})
            </span>
          </div>
        </div>

        {/* User's Preferred Genres Badges */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--steam-muted)", fontWeight: "600" }}>
            Focus:
          </span>
          {(user?.preferredGenres || []).slice(0, 3).map((g) => (
            <span
              key={g}
              style={{
                fontSize: "11px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(255, 85, 0, 0.1)",
                color: "var(--steam-orange)",
                fontWeight: "600",
                border: "1px solid rgba(255, 85, 0, 0.25)",
              }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Modern Hero Card (Directly inspired by Mockup: AVATAR 3 Hero Banner) */}
      <div className="modern-hero-banner">
        {/* Ambient Cover Artwork on Right */}
        <div
          className="modern-hero-bg-art"
          style={{ backgroundImage: `url(${featuredBook.coverImg || featuredBook.book_image})` }}
        />
        <div className="modern-hero-gradient-overlay" />

        {/* Content on Left */}
        <div className="modern-hero-content">
          {/* Flame Trending Pill with Personal Match Insight */}
          <div className="modern-hero-trend-pill">
            <span style={{ fontSize: "13px" }}>🔥</span>
            <span>{recommendationReason}</span>
          </div>

          {/* Book Title */}
          <h1 className="modern-hero-title">
            {featuredBook.title || featuredBook.bookname}
          </h1>

          {/* Metadata Row: Year · Shelf Location · Rating */}
          <div className="modern-hero-meta-row">
            <span>{featuredBook.edition ? featuredBook.edition.split(" ")[0] : "Campus Edition"}</span>
            <span className="modern-hero-bullet">•</span>
            <span style={{ color: "#f0a500", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Icon name="pin" size={13} color="#f0a500" />
              {featuredBook.location}
            </span>
            <span className="modern-hero-bullet">•</span>
            <span style={{ color: "#ff8c42", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Icon name="star" size={13} color="#ff8c42" />
              {featuredBook.rating} / 5.0
            </span>
            {featuredBook.matchScore && (
              <>
                <span className="modern-hero-bullet">•</span>
                <span style={{ color: "#4ade80", fontWeight: "700" }}>
                  {featuredBook.matchScore}% Match
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="modern-hero-desc">
            {featuredBook.summary}
          </p>

          {/* Action Buttons: Watch/Read & Download/Lock */}
          <div className="modern-hero-btn-row">
            <button
              className="modern-hero-btn-primary"
              onClick={() => onSelectBook(featuredBook.id)}
            >
              <Icon name="play" size={14} color="#000000" />
              <span>Read / Details</span>
            </button>

            <button
              className="modern-hero-btn-secondary"
              onClick={handleLockDigitally}
              disabled={featuredBook.copies <= 0}
            >
              <Icon name="lock" size={14} color="currentColor" />
              <span>{featuredBook.copies > 0 ? "Lock (24h)" : "Waitlist"}</span>
            </button>

            <button
              className="modern-hero-btn-icon"
              onClick={() => setActiveTab("books")}
              title="Explore More"
            >
              <Icon name="store" size={16} color="currentColor" />
            </button>
          </div>

          {lockStatus && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#4ade80", fontWeight: "600" }}>
              ✓ {lockStatus}
            </div>
          )}
        </div>

        {/* Vertical Switcher Buttons on Right (Inspired by mockup: ⌃ and ⌄ buttons) */}
        <div className="modern-hero-vertical-nav">
          <button
            className="modern-hero-nav-circle"
            onClick={handlePrevHero}
            title="Previous Recommendation"
          >
            <Icon name="chevronUp" size={16} color="#ffffff" />
          </button>
          <button
            className="modern-hero-nav-circle"
            onClick={handleNextHero}
            title="Next Recommendation"
          >
            <Icon name="chevronDown" size={16} color="#ffffff" />
          </button>
        </div>
      </div>

      {/* SECTION 1: Continue Reading (If user has books in progress) */}
      {userContinueReading.length > 0 && (
        <section className="book-shelf-wrap" style={{ marginTop: "38px" }}>
          <div className="steam-section-head">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Continue Reading</h2>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(255, 85, 0, 0.12)",
                  color: "var(--steam-orange)",
                  fontWeight: "700",
                }}
              >
                {userContinueReading.length} in progress
              </span>
            </div>
            <button
              className="steam-link"
              onClick={() => setActiveTab("library")}
              style={{ fontSize: "13px", fontWeight: "600" }}
            >
              View Reading Tracker →
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {userContinueReading.map((item) => (
              <div
                key={item.bookId || item.id}
                onClick={() => onSelectBook(item.bookId)}
                style={{
                  display: "flex",
                  gap: "14px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "var(--steam-card-bg)",
                  border: "1px solid var(--steam-border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                className="continue-reading-card"
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  style={{
                    width: "56px",
                    aspectRatio: "1 / 1.5",
                    borderRadius: "8px",
                    objectFit: "cover",
                    flexShrink: 0,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--steam-text)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--steam-muted)", marginTop: "2px" }}>
                      {item.chapter}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--steam-muted)", marginBottom: "4px" }}>
                      <span>Progress</span>
                      <span style={{ color: "var(--steam-orange)", fontWeight: "700" }}>{item.progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: "var(--steam-input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${item.progress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #ff7722, var(--steam-orange))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: Recommended For You (Personalized ML-style algorithm) */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Recommended For You</h2>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #ff6200, #ff4500)",
                  color: "#ffffff",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Personalized
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Ranked for {user?.name} based on {user?.major} and your interest in {(user?.preferredGenres || []).join(", ")}
            </p>
          </div>
          <button
            className="steam-link"
            onClick={() => setActiveTab("books")}
            style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span>See all</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>

        <div id="shelf-personalized" className="book-shelf-track">
          {personalizedBooks.map((book) => (
            <BookTile
              key={book.id || book.isbn}
              book={book}
              onSelect={onSelectBook}
              showAction={false}
            />
          ))}
        </div>

        <button
          className="book-shelf-arrow"
          onClick={() => scrollShelf("shelf-personalized", "right")}
          title="Next recommendations"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </section>

      {/* SECTION 3: Major-Specific Shelf (e.g. Computer Science, Architecture, Economics) */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>
              Department Shelf: {user?.major}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Essential references and textbooks for {user?.year} coursework
            </p>
          </div>
          <button
            className="steam-link"
            onClick={() => setActiveTab("books")}
            style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span>Explore Department</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>

        <div id="shelf-major" className="book-shelf-track">
          {majorBooks.map((book) => (
            <BookTile
              key={book.id || book.isbn}
              book={book}
              onSelect={onSelectBook}
              showAction={false}
            />
          ))}
        </div>

        <button
          className="book-shelf-arrow"
          onClick={() => scrollShelf("shelf-major", "right")}
          title="Next department books"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </section>

      {/* SECTION 4: Campus Bestsellers & Popular */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Campus Bestsellers</h2>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Most borrowed titles across all campus faculties this month
            </p>
          </div>
          <button
            className="steam-link"
            onClick={() => setActiveTab("books")}
            style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span>See all</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>

        <div id="shelf-bestsellers" className="book-shelf-track">
          {books.slice(15, 30).map((book) => (
            <BookTile
              key={book.id || book.isbn}
              book={book}
              onSelect={onSelectBook}
              showAction={false}
            />
          ))}
        </div>

        <button
          className="book-shelf-arrow"
          onClick={() => scrollShelf("shelf-bestsellers", "right")}
          title="Next bestsellers"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </section>
    </div>
  );
}
