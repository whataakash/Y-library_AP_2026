import { useState } from "react";
import Icon from "./Icon";
import { capitalizeTitle, capitalizeAuthor } from "../utils/formatters";

// BookTile: Portrait aspect-ratio (1 : 1.5) book tile
// Inspired by Kindle digital store layouts, styled in Steam pitch-black & orange
export default function BookTile({
  book,
  onSelect,
  onLock,
  showAction = true,
  style = {},
}) {
  if (!book) return null;

  const [imgError, setImgError] = useState(false);

  const displayTitle = capitalizeTitle(book.title || book.bookname || "");
  const displayAuthor = capitalizeAuthor(book.author || "");
  const rating = parseFloat(book.rating || "4.5");
  const fullStars = Math.min(5, Math.floor(rating));
  const reviewsCount = book.reviewsCount || ((Math.abs(hashCode(displayTitle)) % 800) + 25);
  const copies = Number(book.copies ?? book.available_count ?? 0);
  const isAvailable = copies > 0;

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // Genre gradient for graceful typographic book jackets
  const genreGradients = {
    Technology: "linear-gradient(135deg, #1e3a8a 0%, #090d16 100%)",
    "Science Fiction": "linear-gradient(135deg, #312e81 0%, #0a0818 100%)",
    Fantasy: "linear-gradient(135deg, #581c87 0%, #150624 100%)",
    Philosophy: "linear-gradient(135deg, #78350f 0%, #1c0d02 100%)",
    Psychology: "linear-gradient(135deg, #134e4a 0%, #031412 100%)",
    Economics: "linear-gradient(135deg, #14532d 0%, #031408 100%)",
    History: "linear-gradient(135deg, #701a75 0%, #1a031c 100%)",
    Science: "linear-gradient(135deg, #0e7490 0%, #02171e 100%)",
    Classics: "linear-gradient(135deg, #831843 0%, #20040f 100%)",
    Mystery: "linear-gradient(135deg, #1f2937 0%, #030712 100%)",
    Thriller: "linear-gradient(135deg, #991b1b 0%, #180303 100%)",
    Biography: "linear-gradient(135deg, #374151 0%, #080a0e 100%)",
  };
  const bgGradient = genreGradients[book.genre] || "linear-gradient(135deg, #18181b 0%, #040406 100%)";

  return (
    <div
      className="book-tile"
      onClick={() => onSelect && onSelect(book)}
      style={style}
    >
      {/* 1 : 1.5 Aspect Ratio Book Cover */}
      <div className="book-tile-cover-wrap">
        {!imgError ? (
          <img
            src={book.coverImg || book.book_image}
            alt={book.title || book.bookname}
            className="book-tile-cover-img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Graceful Hardcover Typographic Jacket Fallback */
          <div
            style={{
              width: "100%",
              height: "100%",
              background: bgGradient,
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              borderLeft: "4px solid rgba(255, 255, 255, 0.15)", // Spine highlight
            }}
          >
            <div>
              <div style={{ fontSize: "9px", letterSpacing: "1px", textTransform: "uppercase", color: "var(--steam-orange)", fontWeight: "800", marginBottom: "8px" }}>
                Y-Library Collection
              </div>
              <h5 style={{ fontSize: "13px", fontWeight: "800", color: "#ffffff", lineHeight: "1.3", margin: 0 }}>
                {displayTitle}
              </h5>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#cbd5e1", fontWeight: "600" }}>
                {displayAuthor}
              </div>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>
                ISBN {book.isbn ? book.isbn.slice(-4) : "ED"}
              </div>
            </div>
          </div>
        )}

        {/* Availability Badge */}
        <div className={`book-tile-badge-copies ${isAvailable ? "available" : "unavailable"}`}>
          {isAvailable ? `✓ In Stock (${copies} copies)` : "✕ Currently Loaned Out"}
        </div>

        {/* Genre Pill */}
        <div className="book-tile-badge-genre">
          {book.genre || "Book"}
        </div>
      </div>

      {/* Book Metadata Below Cover */}
      <div className="book-tile-meta">
        {/* Rating row: 4.8 ★★★★★ (2,542) */}
        <div className="book-tile-rating-row">
          <span className="book-tile-rating-num">{rating.toFixed(1)}</span>
          <div className="book-tile-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < fullStars ? "var(--steam-orange)" : "#3b4252", fontSize: "11px" }}>
                ★
              </span>
            ))}
          </div>
          <span className="book-tile-reviews-count">({reviewsCount.toLocaleString()})</span>
        </div>

        {/* Title */}
        <h4 className="book-tile-title" title={displayTitle}>
          {displayTitle}
        </h4>

        {/* Author */}
        <div className="book-tile-author" title={displayAuthor}>
          {displayAuthor}
        </div>

        {/* Edition / Format */}
        <div className="book-tile-format">
          <span>{book.edition || "Campus Edition"}</span>
        </div>

        {/* Physical Campus Shelf Location */}
        <div className="book-tile-location" title={book.location}>
          <Icon name="pin" size={11} color="#f0a500" />
          <span>{book.location || "Central Library"}</span>
        </div>

        {/* Optional Digital Lock CTA */}
        {showAction && onLock && (
          <button
            className="book-tile-lock-btn"
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              onLock(e, book.id);
            }}
          >
            <Icon name="lock" size={12} color={isAvailable ? "currentColor" : "#666"} />
            <span>{isAvailable ? "Lock (24h)" : "Unavailable"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
