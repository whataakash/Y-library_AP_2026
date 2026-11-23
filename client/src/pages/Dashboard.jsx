import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Icon from "../components/Icon";
import UserSwitcherModal from "../components/UserSwitcherModal";
import AuthModal from "../components/AuthModal";
import BookTile from "../components/BookTile";

const ALL_GENRES = [
  "Technology",
  "Science Fiction",
  "Philosophy",
  "Psychology",
  "Economics",
  "Business",
  "History",
  "Science",
  "Classics",
  "Fantasy",
  "Mystery",
  "General Fiction",
];

export default function Dashboard({ onSelectBook, setActiveTab }) {
  const {
    user,
    isAuthenticated,
    logout,
    markAsRead,
    toggleFavorite,
    toggleGenrePreference,
    startOrUpdateReading,
    removeContinueReading,
  } = useAuth();

  const [allBooks, setAllBooks] = useState([]);
  const [locks, setLocks] = useState([]);
  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [readlists, setReadlists] = useState([]);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const books = await api.getBooks();
    setAllBooks(books);
    const activeLocks = await api.getActiveLocks();
    setLocks(activeLocks.filter((l) => l.status === "Locked"));
    const lists = await api.getReadlists();
    setReadlists(lists);

    // Fetch PostgreSQL DB borrow loans
    const loans = await api.getUserBorrowHistory(user?.email || "student@university.edu");
    setBorrowedRecords(loans.filter((r) => r.status === "BORROWED"));
  };

  const handleReturnBook = async (borrowId) => {
    try {
      await api.returnBookToDB(borrowId);
      alert("Book successfully returned to university library shelf!");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to return book.");
    }
  };

  const handleReleaseLock = async (lockId) => {
    await api.releaseLock(lockId);
    loadData();
  };

  // User curated lists
  const readBooks = allBooks.filter((b) =>
    user?.readBooks?.some((id) => String(id) === String(b.id || b.isbn))
  );

  const favoriteBooks = allBooks.filter((b) =>
    user?.favorites?.some((id) => String(id) === String(b.id || b.isbn))
  );

  const continueReadingList = user?.continueReading || [];

  const goalTarget = user?.readingGoal?.target || 10;
  const goalCompleted = user?.readBooks?.length || user?.readingGoal?.completed || 0;
  const goalPercent = Math.min(100, Math.round((goalCompleted / goalTarget) * 100));

  return (
    <div>
      {/* Profile Header */}
      <div
        style={{
          background: "var(--steam-panel)",
          border: "1px solid var(--steam-border)",
          borderRadius: "16px",
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          boxShadow: "var(--steam-shadow)",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid var(--steam-orange)",
            }}
          />
          <div>
            <div style={{ fontSize: "11px", color: "var(--steam-orange)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
              CAMPUS STUDENT PROFILE · {user?.studentId || "STU-2026"}
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "900", color: "var(--steam-text)" }}>
              {user?.name}
            </h2>
            <p style={{ color: "var(--steam-muted)", fontSize: "13px", marginTop: "2px" }}>
              {user?.major} • {user?.year} • {user?.email}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="steam-btn-primary"
            style={{
              padding: "10px 18px",
              fontSize: "13px",
              borderRadius: "10px",
            }}
          >
            <span>Switch / Add Account ⇄</span>
          </button>
          <button
            onClick={logout}
            style={{
              padding: "10px 16px",
              fontSize: "13px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Grid of Student Metrics & Reading Goal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {/* Semester Reading Goal */}
        <div
          style={{
            background: "var(--steam-panel)",
            border: "1px solid var(--steam-border)",
            borderRadius: "14px",
            padding: "18px 20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--steam-muted)", fontWeight: "600" }}>
              SEMESTER READING GOAL
            </span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--steam-orange)" }}>
              {goalCompleted} / {goalTarget} Books
            </span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "var(--steam-input-bg)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
            <div
              style={{
                width: `${goalPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #F95C4B, #FF7B6D)",
              }}
            />
          </div>
          <div style={{ fontSize: "11px", color: "var(--steam-muted)" }}>
            {goalPercent}% complete · {user?.readingGoal?.streakDays || 12}-day reading streak 🔥
          </div>
        </div>

        {/* Total Read */}
        <div
          style={{
            background: "var(--steam-panel)",
            border: "1px solid var(--steam-border)",
            borderRadius: "14px",
            padding: "18px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--steam-text)" }}>
            {readBooks.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--steam-muted)", fontWeight: "700", marginTop: "2px" }}>
            FINISHED BOOKS
          </div>
        </div>

        {/* In Progress */}
        <div
          style={{
            background: "var(--steam-panel)",
            border: "1px solid var(--steam-border)",
            borderRadius: "14px",
            padding: "18px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--steam-orange)" }}>
            {continueReadingList.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--steam-muted)", fontWeight: "700", marginTop: "2px" }}>
            CURRENTLY READING
          </div>
        </div>

        {/* Favorites */}
        <div
          style={{
            background: "var(--steam-panel)",
            border: "1px solid var(--steam-border)",
            borderRadius: "14px",
            padding: "18px 20px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "28px", fontWeight: "900", color: "#f0a500" }}>
            {favoriteBooks.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--steam-muted)", fontWeight: "700", marginTop: "2px" }}>
            FAVORITES SAVED
          </div>
        </div>
      </div>

      {/* Interactive Preferred Reading Genres Filter */}
      <section
        style={{
          background: "var(--steam-panel)",
          border: "1px solid var(--steam-border)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--steam-text)" }}>
              My Preferred Genres & Recommendation Interests
            </h3>
            <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>
              Toggle your topics below to instantly re-tune your personalized catalog recommendations:
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ALL_GENRES.map((g) => {
            const isSelected = (user?.preferredGenres || []).includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGenrePreference(g)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "600",
                  background: isSelected
                    ? "linear-gradient(135deg, #FF6F5E, #F95C4B)"
                    : "var(--steam-input-bg)",
                  color: isSelected ? "#F6F4F1" : "var(--steam-muted)",
                  border: isSelected
                    ? "1px solid var(--steam-orange)"
                    : "1px solid var(--steam-border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {isSelected ? "✓ " : "+ "}
                {g}
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue Reading Tracker */}
      <section style={{ marginBottom: "36px" }}>
        <div className="steam-section-head">
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Icon name="play" size={18} color="var(--steam-orange)" />
            <span>My Active Reading Tracker</span>
          </h2>
        </div>

        {continueReadingList.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {continueReadingList.map((item) => (
              <div
                key={item.bookId || item.id}
                style={{
                  background: "var(--steam-panel)",
                  border: "1px solid var(--steam-border)",
                  borderRadius: "14px",
                  padding: "16px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                }}
              >
                <img
                  src={item.cover}
                  alt={item.title}
                  style={{
                    width: "60px",
                    aspectRatio: "1 / 1.5",
                    borderRadius: "8px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "var(--steam-text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "11px", color: "var(--steam-muted)", marginTop: "2px" }}>
                    {item.chapter}
                  </p>
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                      <span style={{ color: "var(--steam-muted)" }}>Progress</span>
                      <span style={{ color: "var(--steam-orange)", fontWeight: "700" }}>{item.progress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "4px", background: "var(--steam-input-bg)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${item.progress}%`, height: "100%", background: "var(--steam-orange)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <button
                      onClick={() => onSelectBook(item.book || item.bookId || item.id)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background: "var(--steam-orange)",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => removeContinueReading(item.bookId)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--steam-border)",
                        color: "var(--steam-muted)",
                        fontSize: "11px",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--steam-muted)", background: "var(--steam-panel)", borderRadius: "12px" }}>
            You haven't added any books to your active reading list yet. Explore the catalog and start reading!
          </div>
        )}
      </section>

      {/* Active PostgreSQL Borrowed Books */}
      {borrowedRecords.length > 0 && (
        <section style={{ marginBottom: "36px" }}>
          <div className="steam-section-head">
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="book" size={18} color="#22c55e" />
              <span>Your Active Campus Loans (PostgreSQL)</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {borrowedRecords.map((record) => (
              <div
                key={record.id}
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid #22c55e",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: "700" }}>
                    DUE: {new Date(record.dueDate).toLocaleDateString()}
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: "var(--steam-text)" }}>
                    {record.book?.bookname || `Book #${record.bookId}`}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>
                    {record.book?.author || "University Collection"}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#f0a500", marginTop: "8px" }}>
                    <Icon name="pin" size={13} color="#f0a500" />
                    <span>{record.book?.location || "Campus Library Shelf"}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleReturnBook(record.id)}
                  style={{
                    marginTop: "14px",
                    padding: "8px",
                    background: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid #22c55e",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--steam-text)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Return Book to Library
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Digital Locks */}
      {locks.length > 0 && (
        <section style={{ marginBottom: "36px" }}>
          <div className="steam-section-head">
            <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="lock" size={18} color="var(--steam-orange)" />
              <span>Your Active Digital Locks (24h Hold)</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {locks.map((lock) => (
              <div
                key={lock.id}
                style={{
                  background: "rgba(255, 98, 0, 0.1)",
                  border: "1px solid var(--steam-orange)",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "var(--steam-orange)", fontWeight: "700" }}>
                    HOLD EXPIRES IN {lock.expiresIn}
                  </div>
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px", color: "var(--steam-text)" }}>
                    {lock.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>{lock.author}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#f0a500", marginTop: "8px" }}>
                    <Icon name="pin" size={13} color="#f0a500" />
                    <span>Central Library / Reserved Shelf</span>
                  </div>
                </div>
                <button
                  onClick={() => handleReleaseLock(lock.id)}
                  style={{
                    marginTop: "14px",
                    padding: "8px",
                    background: "rgba(255, 98, 0, 0.2)",
                    border: "1px solid var(--steam-orange)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--steam-text)",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Release Hold
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Saved Favorites Collection */}
      <section style={{ marginBottom: "36px" }}>
        <div className="steam-section-head">
          <h2>Your Saved Favorites ({favoriteBooks.length})</h2>
          {favoriteBooks.length > 0 && (
            <span style={{ fontSize: "12px", color: "var(--steam-muted)" }}>
              Click any tile to open details
            </span>
          )}
        </div>
        {favoriteBooks.length > 0 ? (
          <div className="book-grid-aspect">
            {favoriteBooks.map((b) => (
              <BookTile
                key={b.id || b.isbn}
                book={b}
                onSelect={onSelectBook}
                showAction={false}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--steam-muted)", background: "var(--steam-panel)", borderRadius: "12px" }}>
            No favorite books saved yet. Click the star on any book to add it!
          </div>
        )}
      </section>

      {/* Books Read Collection */}
      <section style={{ marginBottom: "36px" }}>
        <div className="steam-section-head">
          <h2>Finished Books ({readBooks.length})</h2>
        </div>
        {readBooks.length > 0 ? (
          <div className="book-grid-aspect">
            {readBooks.map((b) => (
              <BookTile
                key={b.id || b.isbn}
                book={b}
                onSelect={onSelectBook}
                showAction={false}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--steam-muted)", background: "var(--steam-panel)", borderRadius: "12px" }}>
            No books marked as read yet.
          </div>
        )}
      </section>

      {/* Switcher Modal */}
      <UserSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />

      {/* Auth Modal (Google Sign-In + Email/Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
