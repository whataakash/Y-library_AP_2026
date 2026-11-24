import { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calculateBookMatchScore, getRecommendationReason } from "../services/personalization";
import { capitalizeTitle, capitalizeAuthor } from "../utils/formatters";
import Icon from "../components/Icon";

// BookDetails: Modular page displaying single book information
// Uses clean React props: book (full object), bookId (identifier), onBack (callback)
export default function BookDetails({ book: propBook, bookId, onBack }) {
  const { user, markAsRead, toggleFavorite } = useAuth();
  
  // State for the currently displayed book
  const [book, setBook] = useState(propBook || null);
  const [ageLevel, setAgeLevel] = useState("5");
  const [llmSummary, setLlmSummary] = useState("");
  const [llmLoading, setLlmLoading] = useState(false);

  // Peer review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [lockMsg, setLockMsg] = useState("");
  const [borrowMsg, setBorrowMsg] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [copiedIsbn, setCopiedIsbn] = useState(false);

  // Role-based permissions
  const isAdmin = user?.role === "admin";
  const isLibrarian = user?.role === "librarian";

  // Admin/Librarian Edit Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    genre: "",
    location: "",
    copies: 1,
    totalCopies: 1,
  });

  const handleOpenEdit = () => {
    setEditForm({
      title: book?.title || book?.bookname || "",
      author: book?.author || "",
      genre: book?.genre || "General",
      location: book?.location || "Central Library / A-01",
      copies: book?.copies ?? book?.available_count ?? 1,
      totalCopies: book?.totalCopies ?? book?.total_count ?? 1,
    });
    setIsEditing(true);
  };

  const handleSaveBookEdit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateBook(book.id, {
        bookname: editForm.title,
        author: editForm.author,
        genre: editForm.genre,
        location: editForm.location,
        available_count: parseInt(editForm.copies, 10),
        total_count: parseInt(editForm.totalCopies, 10),
      });
      setBook((prev) => ({
        ...prev,
        title: editForm.title,
        bookname: editForm.title,
        author: editForm.author,
        genre: editForm.genre,
        location: editForm.location,
        copies: parseInt(editForm.copies, 10),
        available_count: parseInt(editForm.copies, 10),
        totalCopies: parseInt(editForm.totalCopies, 10),
        total_count: parseInt(editForm.totalCopies, 10),
      }));
      setIsEditing(false);
      setBorrowMsg("✓ Book details updated successfully!");
      setTimeout(() => setBorrowMsg(""), 4000);
    } catch (err) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleDeleteBook = async () => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to delete "${book.title}" from the catalog?`)) {
      await api.deleteBook(book.id);
      if (onBack) onBack();
    }
  };

  // Load book details whenever propBook or bookId changes
  useEffect(() => {
    // 1. If full book object is passed via props, use it immediately
    if (propBook) {
      setBook(propBook);
      loadSummary(propBook, "5");
      return;
    }

    // 2. Otherwise fetch book by ID or ISBN from the API/catalog
    if (bookId) {
      api.getBookById(bookId).then((data) => {
        if (data) {
          setBook(data);
          loadSummary(data, "5");
        }
      });
    }
  }, [propBook, bookId]);

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
      setLockMsg(`Book successfully locked for 24h under ${user?.name}!`);
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

  const handleCopyIsbn = () => {
    navigator.clipboard.writeText(book.isbn);
    setCopiedIsbn(true);
    setTimeout(() => {
      setCopiedIsbn(false);
    }, 2000);
  };

  if (!book) return <div style={{ padding: "40px" }}>Loading book details...</div>;

  const isRead = user?.readBooks?.some((id) => String(id) === String(book.id));
  const isFavorite = user?.favorites?.some((id) => String(id) === String(book.id));

  const matchScore = calculateBookMatchScore(user, book);
  const recommendationReason = getRecommendationReason(user, book);

  const getEstimatedReadingHours = () => {
    if (!book) return 5;
    if (typeof book.readingTime === "number") return book.readingTime;
    if (typeof book.reading_time === "number") return book.reading_time;

    let pages = book.pageCount || book.pages || book.page_count || book.numPages;
    if (!pages && book.edition) {
      const pageMatch = String(book.edition).match(/(\d+)\s*(?:pages?|pp?\.?)/i);
      if (pageMatch) {
        pages = parseInt(pageMatch[1], 10);
      } else if (/^\d+$/.test(String(book.edition).trim()) && Number(book.edition) > 30) {
        pages = Number(book.edition);
      }
    }
    const pagesNum = Number(pages);
    if (pagesNum && !isNaN(pagesNum) && pagesNum > 0) {
      return Math.max(1, Math.round(pagesNum / 50));
    }
    return 5;
  };

  const readingHours = getEstimatedReadingHours();

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
          cursor: "pointer",
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
          background: "var(--steam-panel)",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid var(--steam-border)",
          boxShadow: "var(--steam-shadow)",
        }}
      >
        {/* Left Column: Cover & Profile Actions */}
        <div>
          <img
            src={book.coverImg}
            alt={book.title}
            style={{
              width: "100%",
              aspectRatio: "1 / 1.5",
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
                background: isRead ? "rgba(34, 197, 94, 0.2)" : "var(--steam-input-bg)",
                border: `1px solid ${isRead ? "#22c55e" : "var(--steam-border)"}`,
                color: isRead ? "#22c55e" : "var(--steam-text)",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icon name="check" size={15} color={isRead ? "#22c55e" : "currentColor"} />
              <span>{isRead ? "Read (Added to Your Profile)" : "Mark as Read"}</span>
            </button>

            <button
              onClick={() => toggleFavorite(book.id)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: isFavorite ? "rgba(255, 98, 0, 0.2)" : "var(--steam-input-bg)",
                border: `1px solid ${isFavorite ? "var(--steam-orange)" : "var(--steam-border)"}`,
                color: isFavorite ? "var(--steam-orange)" : "var(--steam-text)",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icon name="star" size={15} color={isFavorite ? "var(--steam-orange)" : "currentColor"} />
              <span>{isFavorite ? "In Your Favorites" : "Add to Favorites"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Information & Personalization Engine */}
        <div>
          {/* Personalized Student Insight Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 85, 0, 0.08)",
              border: "1px solid rgba(255, 85, 0, 0.3)",
              padding: "10px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "16px" }}>✨</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--steam-orange)" }}>
                {recommendationReason}
              </div>
              <div style={{ fontSize: "11px", color: "var(--steam-muted)" }}>
                Curated specifically for {user?.name} ({user?.major})
              </div>
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "var(--steam-orange)",
                background: "rgba(255, 42, 42, 0.15)",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              {matchScore}%
            </span>
          </div>

          <div style={{ fontSize: "12px", color: "var(--steam-orange)", fontWeight: "700" }}>
            {book.genre} · {book.tags?.join(", ")}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "6px 0", color: "var(--steam-text)" }}>
            {capitalizeTitle(book.title || book.bookname)}
          </h1>
          <p style={{ fontSize: "16px", color: "var(--steam-muted)", marginBottom: "16px" }}>
            by {capitalizeAuthor(book.author)}
          </p>

          {/* Book Metadata Badges */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--steam-input-bg)",
                border: "1px solid var(--steam-border)",
                color: "var(--steam-text)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                position: "relative",
              }}
            >
              <span>
                ISBN: <b>{book.isbn || "N/A"}</b>
              </span>
              <button
                type="button"
                onClick={handleCopyIsbn}
                title={copiedIsbn ? "Copied!" : "Copy ISBN"}
                aria-label="Copy ISBN"
                style={{
                  background: copiedIsbn ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.08)",
                  border: `1px solid ${copiedIsbn ? "#22c55e" : "var(--steam-border)"}`,
                  color: copiedIsbn ? "#22c55e" : "var(--steam-text)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                  lineHeight: "1.2",
                }}
              >
                <Icon name={copiedIsbn ? "check" : "clipboard"} size={11} color={copiedIsbn ? "#22c55e" : "currentColor"} />
                <span>{copiedIsbn ? "Copied!" : "Copy"}</span>
              </button>
              {copiedIsbn && (
                <span
                  style={{
                    position: "absolute",
                    top: "-24px",
                    right: "0",
                    background: "#22c55e",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: "700",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  Copied!
                </span>
              )}
            </span>
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--steam-input-bg)",
                border: "1px solid var(--steam-border)",
                color: "var(--steam-text)",
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
            <span
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                background: "var(--steam-input-bg)",
                border: "1px solid var(--steam-border)",
                color: "var(--steam-text)",
              }}
            >
              ⏱ ~{readingHours} hrs read
            </span>
          </div>

          <p style={{ lineHeight: 1.6, color: "var(--steam-text-secondary)", marginBottom: "20px" }}>
            {book.summary}
          </p>

          {/* Location & Availability Box */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              background: "var(--steam-input-bg)",
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

          {/* Role-Based Privileged Action Bar (Admins & Librarians) */}
          {(isAdmin || isLibrarian) && (
            <div
              style={{
                marginBottom: "20px",
                padding: "14px 18px",
                borderRadius: "10px",
                background: isAdmin ? "rgba(239, 68, 68, 0.08)" : "rgba(14, 165, 233, 0.08)",
                border: isAdmin ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(14, 165, 233, 0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", color: isAdmin ? "#ef4444" : "#38bdf8", textTransform: "uppercase" }}>
                    {isAdmin ? "👑 Administrator Privileges" : "📚 Librarian Inventory Privileges"}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--steam-text)", fontWeight: "600" }}>
                    {isAdmin
                      ? "You can edit book details, shelf location, copies, or remove this title."
                      : "You can update physical shelf coordinates and physical copy counts."}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleOpenEdit}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.2)",
                      border: "1px solid #3b82f6",
                      color: "#60a5fa",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit Book & Shelf
                  </button>
                  {isAdmin && (
                    <button
                      onClick={handleDeleteBook}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "1px solid #ef4444",
                        color: "#f87171",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Delete Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CTAs: PostgreSQL Borrow & Digital Lock */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
            <button
              onClick={handleBorrowDB}
              disabled={book.copies <= 0 || isBorrowing}
              style={{
                padding: "12px 22px",
                borderRadius: "10px",
                background:
                  book.copies > 0
                    ? "var(--steam-orange)"
                    : "#333",
                color: "#F6F4F1",
                fontWeight: "700",
                fontSize: "13px",
                boxShadow: book.copies > 0 ? "0 4px 14px rgba(255, 42, 42, 0.4)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
                cursor: book.copies > 0 ? "pointer" : "not-allowed",
              }}
            >
              <Icon name="book" size={16} color="#fff" />
              <span>{isBorrowing ? "Processing..." : `Borrow Book as ${user?.name}`}</span>
            </button>

            <button
              onClick={handleLock}
              disabled={book.copies <= 0}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                background: "var(--steam-input-bg)",
                border: "1px solid var(--steam-border)",
                color: "var(--steam-text)",
                fontWeight: "600",
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: book.copies > 0 ? "pointer" : "not-allowed",
              }}
            >
              <Icon name="lock" size={15} color="currentColor" />
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
                background: "rgba(255, 42, 42, 0.15)",
                border: "1px solid var(--steam-orange)",
                color: "var(--steam-orange)",
                fontSize: "13px",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              ✓ {lockMsg}
            </div>
          )}

          {/* AI ELI5 Explanations */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "10px", color: "var(--steam-text)" }}>
              AI Simplified Explanations
            </h3>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {[
                { label: "ELI5 (Child)", val: "5" },
                { label: "ELI10 (Student)", val: "10" },
                { label: "Freshman College", val: "15" },
              ].map((lvl) => (
                <button
                  key={lvl.val}
                  onClick={() => loadSummary(book, lvl.val)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    background: ageLevel === lvl.val ? "var(--steam-orange)" : "var(--steam-input-bg)",
                    color: "#fff",
                    border: "1px solid var(--steam-border)",
                  }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <div
              style={{
                background: "var(--steam-input-bg)",
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--steam-border)",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--steam-text-secondary)",
              }}
            >
              {llmLoading ? "Generating AI summary..." : llmSummary}
            </div>
          </div>

          {/* Peer Reviews */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "var(--steam-text)" }}>
              Campus Peer Reviews
            </h3>
            <form onSubmit={handleAddReview} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={{ width: "120px", fontSize: "13px" }}
                >
                  <option value={5}>★★★★★ (5)</option>
                  <option value={4}>★★★★☆ (4)</option>
                  <option value={3}>★★★☆☆ (3)</option>
                  <option value={2}>★★☆☆☆ (2)</option>
                  <option value={1}>★☆☆☆☆ (1)</option>
                </select>
                <input
                  type="text"
                  placeholder={`Write your peer note as ${user?.name}...`}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ flex: 1, fontSize: "13px" }}
                />
                <button
                  type="submit"
                  className="steam-btn-primary"
                  style={{ padding: "0 18px", fontSize: "13px", borderRadius: "8px" }}
                >
                  Post
                </button>
              </div>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(book.peerReviews || []).map((rev, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--steam-input-bg)",
                    border: "1px solid var(--steam-border)",
                    borderRadius: "8px",
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <b style={{ fontSize: "13px", color: "var(--steam-text)" }}>{rev.user}</b>
                    <span style={{ color: "var(--steam-orange)", fontSize: "12px" }}>
                      {"★".repeat(rev.rating)}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--steam-text-secondary)" }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin / Librarian Quick Edit Modal */}
      {isEditing && (
        <div className="steam-modal-veil" onClick={() => setIsEditing(false)}>
          <div className="steam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--steam-text)" }}>
                {isAdmin ? "👑 Admin: Edit Book Metadata" : "📚 Librarian: Edit Shelf & Copies"}
              </h3>
              <button onClick={() => setIsEditing(false)} style={{ color: "var(--steam-muted)", fontSize: "16px" }}>✕</button>
            </div>

            <form onSubmit={handleSaveBookEdit}>
              {isAdmin && (
                <>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Title</label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Author</label>
                    <input
                      type="text"
                      required
                      value={editForm.author}
                      onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px" }}
                    />
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Genre</label>
                    <input
                      type="text"
                      required
                      value={editForm.genre}
                      onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
                      style={{ width: "100%", padding: "8px 12px" }}
                    />
                  </div>
                </>
              )}

              {/* Both Admin and Librarian can adjust shelf location and copies */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  📍 Physical Shelf Coordinates
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Library / Floor 2, Shelf B-14"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.totalCopies}
                    onChange={(e) => setEditForm({ ...editForm, totalCopies: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.copies}
                    onChange={(e) => setEditForm({ ...editForm, copies: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", background: "transparent", border: "1px solid var(--steam-border)", color: "var(--steam-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--steam-orange)", border: "none", color: "#ffffff", fontWeight: "700" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
