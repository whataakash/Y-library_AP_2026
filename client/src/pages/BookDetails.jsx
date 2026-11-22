import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";

export default function BookDetails({ bookId, onBack }) {
  const { user, markAsRead, toggleFavorite } = useAuth();
  const [book, setBook] = useState(null);
  const [ageLevel, setAgeLevel] = useState("5");
  const [llmSummary, setLlmSummary] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);

  // Peer review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [lockMsg, setLockMsg] = useState("");
  const [borrowMsg, setBorrowMsg] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);

  useEffect(() => {
    api.getBookById(bookId).then((data) => {
      setBook(data);
      if (data) {
        loadSummary(data, "5");
      }
    });
  }, [bookId]);

  const loadSummary = async (bookData, age) => {
    setLlmLoading(true);
    setAgeLevel(age);
    const summary = await api.getLLMSummary(bookData, age);
    setLlmSummary(summary);
    setLlmLoading(false);
  };

  const handleLock = async () => {
    try {
      await api.lockBookDigitally(book.id, user?.name);
      setLockMsg("Book successfully locked for 24 hours! Visit shelf to pick it up.");
      const updated = await api.getBookById(book.id);
      setBook(updated);
    } catch (err) {
      alert(err.message || "Failed to lock book.");
    }
  };

  const handleBorrowDB = async () => {
    setIsBorrowing(true);
    setBorrowMsg("");
    try {
      const res = await api.borrowBookFromDB(
        book.id,
        user?.name || "Student Reader",
        user?.email || "student@university.edu"
      );
      setBorrowMsg(res.message || "Book borrowed successfully from PostgreSQL database!");
      const updated = await api.getBookById(book.id);
      setBook(updated);
    } catch (err) {
      alert(
        err.message ||
          "Could not borrow book from database. (Make sure backend server and PostgreSQL are running)"
      );
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewText) return;
    const updated = await api.addReview(book.id, {
      user: user?.name || "Anonymous Reader",
      rating: reviewRating,
      comment: reviewText,
    });
    setBook(updated);
    setReviewText("");
  };

  if (!book) return <div style={{ padding: "40px" }}>Loading book details...</div>;

  const isRead = user?.readBooks?.some((id) => String(id) === String(book.id));
  const isFavorite = user?.favorites?.some((id) => String(id) === String(book.id));

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          color: "var(--steam-muted)",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        <Icon name="arrowLeft" size={16} />
        <span>Back to Store / Explore</span>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "32px",
          background: "linear-gradient(180deg, #0d0d11 0%, #040406 100%)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid var(--steam-border)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9)",
        }}
      >
        {/* Left Column: Cover & Profile Actions */}
        <div>
          <img
            src={book.coverImg}
            alt={book.title}
            style={{
              width: "100%",
              height: "400px",
              objectFit: "cover",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              marginBottom: "16px",
            }}
          />

          {/* Profile Curation Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => markAsRead(book.id)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: isRead ? "rgba(34, 197, 94, 0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${isRead ? "#22c55e" : "var(--steam-border)"}`,
                color: isRead ? "#22c55e" : "#fff",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icon name="check" size={15} color={isRead ? "#22c55e" : "#fff"} />
              <span>{isRead ? "Read (Added to Your Profile)" : "Mark as Read"}</span>
            </button>

            <button
              onClick={() => toggleFavorite(book.id)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: isFavorite ? "rgba(255, 98, 0, 0.2)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${isFavorite ? "var(--steam-orange)" : "var(--steam-border)"}`,
                color: isFavorite ? "var(--steam-orange)" : "#fff",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icon name="star" size={15} color={isFavorite ? "var(--steam-orange)" : "#fff"} />
              <span>{isFavorite ? "In Your Favorites" : "Add to Favorites"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Information & Features */}
        <div>
          <div style={{ fontSize: "12px", color: "var(--steam-orange)", fontWeight: "700" }}>
            {book.genre} · {book.tags?.join(", ")}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "6px 0" }}>{book.title}</h1>
          <p style={{ fontSize: "16px", color: "var(--steam-muted)", marginBottom: "16px" }}>
            by {book.author}
          </p>

          {/* Book Metadata Badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--steam-border)",
                color: "#e2e8f0",
              }}
            >
              ISBN: <b>{book.isbn || "N/A"}</b>
            </span>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--steam-border)",
                color: "#e2e8f0",
              }}
            >
              Edition: <b>{book.edition || "1st Edition"}</b>
            </span>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "rgba(255, 98, 0, 0.12)",
                border: "1px solid rgba(255, 98, 0, 0.4)",
                color: "var(--steam-orange)",
              }}
            >
              ★ <b>{book.rating || "4.5"}</b> Rating
            </span>
          </div>

          <p style={{ lineHeight: 1.6, color: "#d0d7de", marginBottom: "20px" }}>{book.summary}</p>

          {/* Location & Availability Box */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              background: "rgba(0,0,0,0.3)",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--steam-border)",
              marginBottom: "20px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "var(--steam-muted)", display: "block" }}>
                PHYSICAL CAMPUS LOCATION
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <Icon name="pin" size={15} color="#f0a500" />
                <b style={{ color: "#f0a500", fontSize: "14px" }}>{book.location}</b>
              </div>
            </div>
            <div>
              <span style={{ fontSize: "11px", color: "var(--steam-muted)", display: "block" }}>
                SHELF AVAILABILITY
              </span>
              <b style={{ color: book.copies > 0 ? "#22c55e" : "#ef4444", fontSize: "14px", display: "block", marginTop: "4px" }}>
                {book.copies > 0 ? `${book.copies} of ${book.totalCopies} copies available` : "All copies currently out"}
              </b>
            </div>
          </div>

          {/* CTAs: PostgreSQL Borrow & Digital Lock */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <button
              onClick={handleBorrowDB}
              disabled={book.copies <= 0 || isBorrowing}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                background:
                  book.copies > 0
                    ? "linear-gradient(135deg, #ff6200, #ff4500)"
                    : "#333",
                color: "#fff",
                fontWeight: "700",
                fontSize: "13px",
                boxShadow: book.copies > 0 ? "0 4px 14px rgba(255, 98, 0, 0.4)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
                cursor: book.copies > 0 ? "pointer" : "not-allowed",
              }}
            >
              <Icon name="book" size={16} color="#fff" />
              <span>{isBorrowing ? "Processing..." : "Borrow from Library (PostgreSQL Loan)"}</span>
            </button>

            <button
              onClick={handleLock}
              disabled={book.copies <= 0}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--steam-border)",
                color: "#fff",
                fontWeight: "600",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: book.copies > 0 ? "pointer" : "not-allowed",
              }}
            >
              <Icon name="lock" size={15} color="#fff" />
              <span>Lock Digitally (24h Hold)</span>
            </button>
          </div>

          {borrowMsg && (
            <div
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                border: "1px solid #22c55e",
                color: "#4ade80",
                fontSize: "13px",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              ✓ {borrowMsg}
            </div>
          )}

          {lockMsg && (
            <div
              style={{
                background: "rgba(255, 98, 0, 0.15)",
                border: "1px solid var(--steam-orange)",
                color: "#ff8c42",
                fontSize: "13px",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              🔒 {lockMsg}
            </div>
          )}

          {/* FEATURE: Free LLM Book Explainer for 5 y/o and 10 y/o */}
          <div
            style={{
              marginTop: "24px",
              background: "rgba(255, 98, 0, 0.08)",
              border: "1px solid rgba(255, 98, 0, 0.3)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="sparkles" size={17} color="var(--steam-orange)" />
                <b style={{ color: "var(--steam-orange)", fontSize: "15px" }}>
                  AI Book Explainer (Free LLM)
                </b>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => loadSummary(book, "5")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: ageLevel === "5" ? "var(--steam-orange)" : "rgba(255,255,255,0.06)",
                    color: "#fff",
                  }}
                >
                  Explain to a 5 y/o
                </button>
                <button
                  onClick={() => loadSummary(book, "10")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: ageLevel === "10" ? "var(--steam-orange)" : "rgba(255,255,255,0.06)",
                    color: "#fff",
                  }}
                >
                  Explain to a 10 y/o
                </button>
              </div>
            </div>

            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#fff" }}>
              {llmLoading ? "Generating AI explanation..." : llmSummary}
            </p>
          </div>

          {/* FEATURE: Peer Ratings & Reviews */}
          <div style={{ marginTop: "32px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "14px" }}>
              Peer Ratings & Reviews ({book.peerReviews?.length || 0})
            </h3>

            {/* Submit Review Form */}
            <form
              onSubmit={handleAddReview}
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "13px", color: "var(--steam-muted)" }}>Your Rating:</span>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  style={{ background: "#222", padding: "4px 10px", borderRadius: "6px" }}
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                  <option value={2}>2 Stars ★★☆☆☆</option>
                  <option value={1}>1 Star ★☆☆☆☆</option>
                </select>
              </div>

              <textarea
                placeholder="Write a peer review for your fellow campus readers..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={2}
                style={{
                  width: "100%",
                  background: "#111",
                  borderRadius: "8px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
              />

              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  background: "var(--steam-orange)",
                  borderRadius: "6px",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "12px",
                }}
              >
                Post Peer Review
              </button>
            </form>

            {/* List Reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {book.peerReviews?.map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--steam-border)",
                    padding: "12px 16px",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <b style={{ fontSize: "13px" }}>{rev.user}</b>
                    <span style={{ color: "#f0a500", display: "inline-flex", gap: "2px" }}>
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Icon key={i} name="star" size={12} color="#f0a500" />
                      ))}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#c9d1d9" }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
