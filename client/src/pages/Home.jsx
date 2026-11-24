import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import BookTile from "../components/BookTile";

export default function Home({
  onSelectBook,
  setActiveTab,
  books: propBooks,
  searchQuery = "",
  setSearchQuery,
  onClearSearch,
  clearSearch,
  onQueryChange,
  onSearchChange,
}) {
  const { user } = useAuth();
  const [books, setBooks] = useState(propBooks || []);
  const [loading, setLoading] = useState(propBooks === undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lockStatus, setLockStatus] = useState("");

  useEffect(() => {
    if (propBooks !== undefined) {
      setBooks(propBooks);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getBooks(searchQuery).then((data) => {
      setBooks(data || []);
      setLoading(false);
    });
  }, [propBooks, searchQuery]);

  const currentBooks = propBooks !== undefined ? propBooks : books;
  const isSearchEmpty = propBooks !== undefined ? propBooks.length === 0 : (!loading && currentBooks.length === 0);

  const handleClearSearch = () => {
    if (onClearSearch) onClearSearch();
    else if (clearSearch) clearSearch();
    if (setSearchQuery) setSearchQuery("");
    if (onSearchChange) onSearchChange("");
    if (onQueryChange) onQueryChange("");
    setLoading(true);
    api.getBooks("").then((data) => {
      setBooks(data || []);
      setLoading(false);
    });
  };

  const userContinueReading = user?.continueReading || [];

  // Top featured book from current books
  const heroCandidates = currentBooks;
  const featuredBook = heroCandidates[currentIndex] || heroCandidates[0] || currentBooks[0];

  // Top iconic bestseller books from the campus database
  const iconicBestsellerQueries = [
    "atomic habits",
    "psychology of money",
    "deep work",
    "sapiens",
    "thinking, fast and slow",
    "zero to one",
  ];

  const matchedBestsellers = iconicBestsellerQueries
    .map((query) =>
      currentBooks.find((b) => {
        const title = (b.title || b.bookname || "").toLowerCase();
        return title.includes(query);
      })
    )
    .filter(Boolean);

  const fallbackBestsellers = currentBooks.filter((b) => {
    const tags = Array.isArray(b.tags) ? b.tags.map((t) => String(t).toLowerCase()) : [];
    return tags.includes("bestseller") || tags.includes("popular");
  });

  const showcaseBooks =
    matchedBestsellers.length >= 6
      ? matchedBestsellers.slice(0, 6)
      : [
          ...matchedBestsellers,
          ...fallbackBestsellers.filter(
            (b) => !matchedBestsellers.some((m) => (m.id || m.title || m.bookname) === (b.id || b.title || b.bookname))
          ),
          ...currentBooks.filter(
            (b) => !matchedBestsellers.some((m) => (m.id || m.title || m.bookname) === (b.id || b.title || b.bookname))
          ),
        ].slice(0, 6);

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
      const updated = await api.getBooks(searchQuery);
      setBooks(updated || []);
      setTimeout(() => setLockStatus(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  if (isSearchEmpty) {
    return (
      <div className="home-search-empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div
          style={{
            maxWidth: "560px",
            margin: "40px auto",
            padding: "48px 32px",
            background: "var(--steam-panel)",
            borderRadius: "16px",
            border: "1px solid var(--steam-border)",
            boxShadow: "var(--steam-shadow)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255, 85, 0, 0.12)",
              border: "1px solid rgba(255, 85, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--steam-orange)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h7" />
              <circle cx="16.5" cy="16.5" r="3.5" />
              <path d="m19 19 3 3" />
            </svg>
          </div>

          <h3
            style={{
              fontSize: "20px",
              fontWeight: "800",
              color: "var(--steam-text)",
              marginBottom: "10px",
            }}
          >
            No Books Found
          </h3>

          <p
            style={{
              fontSize: "14px",
              color: "var(--steam-muted)",
              lineHeight: "1.6",
              marginBottom: "24px",
              maxWidth: "420px",
            }}
          >
            No books found matching your query. Try searching by title, author, or ISBN.
          </p>

          <button
            type="button"
            className="steam-btn-primary"
            onClick={handleClearSearch}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon name="search" size={14} color="#000" />
            <span>Clear Search</span>
          </button>
        </div>
      </div>
    );
  }

  if (!featuredBook) {
    return <div style={{ padding: "40px", color: "var(--steam-muted)" }}>Loading campus catalog...</div>;
  }

  return (
    <div>
      {/* 3D Curved Showcase Hero Section (Matching Mockup Reference) */}
      <section className="curved-hero-section">
        {/* Header Block */}
        <div className="curved-hero-header">
          <span className="curved-hero-eyebrow">Campus Bestsellers</span>
          <h1 className="curved-hero-title">
            Read what you love, until you love to read
          </h1>
          <p className="curved-hero-subtitle">
            Explore 900+ all-time bestsellers, faculty picks, and essential reads across campus.
          </p>
          <button
            type="button"
            className="curved-hero-cta-btn"
            onClick={() => setActiveTab("books")}
            aria-label="See more books"
          >
            <span>See more Books</span>
            <span className="curved-hero-cta-arrow">
              <Icon name="arrowRight" size={14} color="#ffffff" />
            </span>
          </button>
        </div>

        {/* 3D Panoramic Stage */}
        <div className="curved-hero-stage">
          <div className="curved-hero-deck">
            {showcaseBooks.slice(0, 6).map((book, idx) => {
              const cover = book.coverImg || book.book_image;
              const title = book.title || book.bookname || "Library Book";
              const genre = book.genre || "Collection";
              return (
                <div
                  key={book.id || `${title}-${idx}`}
                  className={`curved-hero-card card-pos-${idx}`}
                  onClick={() => onSelectBook(book)}
                  title={`${title} (${genre}) - Click to inspect`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectBook(book);
                    }
                  }}
                >
                  {cover ? (
                    <img
                      src={cover}
                      alt={title}
                      className="curved-hero-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="curved-hero-card-fallback">
                      <div className="curved-hero-card-title">{title}</div>
                      <div className="curved-hero-card-genre">{genre}</div>
                    </div>
                  )}
                  <div className="curved-hero-card-caption">
                    <div className="curved-hero-card-title">{title}</div>
                    <div className="curved-hero-card-genre">{genre}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Feature Steps Underneath */}
        <div className="curved-hero-features-row">
          <div className="curved-hero-feature-item">
            <span className="curved-hero-feature-num">#01</span>
            <span className="curved-hero-feature-title">Curated Catalog</span>
          </div>
          <div className="curved-hero-feature-item">
            <span className="curved-hero-feature-num">#02</span>
            <span className="curved-hero-feature-title">Faculty Picks</span>
          </div>
          <div className="curved-hero-feature-item">
            <span className="curved-hero-feature-num">#03</span>
            <span className="curved-hero-feature-title">Digital Holds</span>
          </div>
          <div className="curved-hero-feature-item">
            <span className="curved-hero-feature-num">#04</span>
            <span className="curved-hero-feature-title">Campus Copilot</span>
          </div>
        </div>
      </section>

      {/* Subtle Result Count Summary */}
      <p
        className="catalog-count-summary"
        style={{
          fontSize: "13px",
          color: "var(--steam-muted)",
          marginTop: "24px",
          marginBottom: "8px",
        }}
      >
        Showing {books.length} available library books
      </p>

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
                onClick={() => onSelectBook(item.book || item.bookId || item.id)}
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
                          background: "var(--steam-orange)",
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

      {/* SECTION 2: Popular Across Campus */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Popular Across Campus</h2>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Most requested library titles across university departments
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

        <div id="shelf-popular" className="book-shelf-track">
          {currentBooks.slice(0, 15).map((book) => (
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
          onClick={() => scrollShelf("shelf-popular", "right")}
          title="Next titles"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </section>

      {/* SECTION 3: Campus Bestsellers */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Campus Bestsellers</h2>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Top borrowed volumes across all academic faculties this semester
            </p>
          </div>
          <button
            className="steam-link"
            onClick={() => setActiveTab("books")}
            style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <span>Explore All</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>

        <div id="shelf-bestsellers" className="book-shelf-track">
          {currentBooks.slice(15, 30).map((book) => (
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

      {/* SECTION 4: New Arrivals & Catalog Highlights */}
      <section className="book-shelf-wrap" style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>New Arrivals & Catalog Highlights</h2>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
              Recently cataloged additions to university shelves and reference archives
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

        <div id="shelf-recent" className="book-shelf-track">
          {currentBooks.slice(30, 45).map((book) => (
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
          onClick={() => scrollShelf("shelf-recent", "right")}
          title="Next additions"
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </section>
    </div>
  );
}
