import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";

export default function Home({ onSelectBook, setActiveTab }) {
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lockStatus, setLockStatus] = useState("");

  useEffect(() => {
    api.getBooks().then((data) => {
      setBooks(data);
    });
  }, []);

  const featuredBook = books[currentIndex] || books[0];
  const specialOffers = books.slice(1, 5);

  const handleLockDigitally = async () => {
    if (!featuredBook) return;
    try {
      await api.lockBookDigitally(featuredBook.id);
      setLockStatus("Book digitally locked for 24 hours!");
      const updated = await api.getBooks();
      setBooks(updated);
      setTimeout(() => setLockStatus(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  if (!featuredBook) {
    return <div style={{ padding: "40px", color: "var(--steam-muted)" }}>Loading campus shelf...</div>;
  }

  return (
    <div>
      {/* Hero Showcase Grid */}
      <div className="steam-hero-grid">
        {/* Left Hero Card */}
        <div>
          <div
            className="steam-hero-left"
            style={{
              backgroundImage: `url(${featuredBook.coverImg})`,
            }}
          >
            <div className="steam-hero-overlay" />

            {/* Category Tags at Top */}
            <div className="steam-tag-row">
              {featuredBook.tags?.map((tag) => (
                <span key={tag} className="steam-tag-pill">
                  {tag}
                </span>
              ))}
              <span
                className="steam-tag-pill"
                style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                onClick={() => setActiveTab("books")}
              >
                <Icon name="plus" size={13} />
              </span>
            </div>

            {/* Stylized Title in Center */}
            <div className="steam-hero-center-info">
              <h1 className="steam-hero-title">{featuredBook.title}</h1>
              <p className="steam-hero-author">by {featuredBook.author}</p>
            </div>

            {/* Overlapping Reader Avatars at Bottom */}
            <div className="steam-hero-readers">
              <div className="steam-avatar-stack">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="Reader"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                  alt="Reader"
                />
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                  alt="Reader"
                />
              </div>
              <span className="steam-readers-text">
                {featuredBook.readers?.length || 12} campus friends read this
              </span>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="steam-carousel-dots">
            {books.slice(0, 5).map((b, idx) => (
              <div
                key={b.id}
                className={`steam-dot ${currentIndex === idx ? "active" : ""}`}
                onClick={() => setCurrentIndex(idx)}
                title={b.title}
              />
            ))}
          </div>
        </div>

        {/* Right Red/Orange Ambient Card */}
        <div className="steam-hero-right">
          <div>
            <div className="steam-detail-header">
              <h3>{featuredBook.title}</h3>
            </div>
            <p className="steam-detail-desc">{featuredBook.summary}</p>

            {/* Physical Location Badge */}
            <div className="steam-location-box">
              <Icon name="pin" size={15} color="#f0a500" />
              <b>{featuredBook.location}</b>
            </div>

            {/* Availability & Price */}
            <div className="steam-price-line">
              {featuredBook.copies > 0
                ? `Available now · ${featuredBook.copies} physical copies left`
                : "Waitlist · 0 copies currently on shelf"}
            </div>

            {/* Action Lock Button */}
            <button
              className="steam-btn-primary"
              onClick={handleLockDigitally}
              disabled={featuredBook.copies <= 0}
            >
              <Icon name="lock" size={16} color="#fff" />
              <span>{featuredBook.copies > 0 ? "Lock Book Digitally (24h)" : "Join Waitlist"}</span>
            </button>

            {lockStatus && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#a3e635",
                  textAlign: "center",
                }}
              >
                {lockStatus}
              </div>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div>
            <div style={{ fontSize: "11px", color: "var(--steam-muted)", marginBottom: "6px" }}>
              Explore other featured books:
            </div>
            <div className="steam-thumb-row">
              {books.slice(0, 3).map((b, idx) => (
                <img
                  key={b.id}
                  src={b.coverImg}
                  alt={b.title}
                  className={`steam-thumb ${currentIndex === idx ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers / Campus Curations Row */}
      <section style={{ marginTop: "40px" }}>
        <div className="steam-section-head">
          <h2>Special offers</h2>
          <button
            className="steam-link"
            onClick={() => setActiveTab("books")}
          >
            Learn more →
          </button>
        </div>

        <div className="steam-cards-row">
          {specialOffers.map((book) => (
            <div
              key={book.id}
              className="steam-card"
              style={{ backgroundImage: `url(${book.coverImg})` }}
              onClick={() => onSelectBook(book.id)}
            >
              <div className="steam-card-overlay" />
              <div className="steam-card-info">
                <div className="steam-card-tag">{book.genre}</div>
                <h4 className="steam-card-title">{book.title}</h4>
                <div className="steam-card-author">{book.author}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                    fontSize: "12px",
                    color: "#f0a500",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Icon name="star" size={12} color="#f0a500" />
                    {book.rating}
                  </span>
                  <span style={{ color: "var(--steam-muted)", fontSize: "11px" }}>
                    {book.copies} copies left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
