import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Icon from "../components/Icon";

export default function Dashboard({ onSelectBook, setActiveTab }) {
  const { user, markAsRead, toggleFavorite } = useAuth();
  const [allBooks, setAllBooks] = useState([]);
  const [locks, setLocks] = useState([]);
  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [readlists, setReadlists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  useEffect(() => {
    loadData();
  }, []);

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
      alert("Book successfully marked as returned in PostgreSQL database!");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to return book to database.");
    }
  };

  const handleReleaseLock = async (lockId) => {
    await api.releaseLock(lockId);
    loadData();
  };

  const handleCreateReadlist = async (e) => {
    e.preventDefault();
    if (!newListName) return;
    await api.createReadlist(newListName, newListDesc);
    setNewListName("");
    setNewListDesc("");
    loadData();
  };

  // Curated read & favorite books
  const readBooks = allBooks.filter((b) =>
    user?.readBooks?.some((id) => String(id) === String(b.id))
  );

  // Book Suggestions: books not read yet
  const suggestions = allBooks
    .filter((b) => !user?.readBooks?.some((id) => String(id) === String(b.id)))
    .slice(0, 3);

  return (
    <div>
      {/* Profile Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #0d0d11 0%, #040406 100%)",
          border: "1px solid var(--steam-border)",
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.9)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src={user?.avatar}
            alt={user?.name}
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: "3px solid var(--steam-orange)",
            }}
          />
          <div>
            <div style={{ fontSize: "12px", color: "var(--steam-orange)", fontWeight: "700" }}>
              CAMPUS READER PROFILE
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "800" }}>{user?.name}</h2>
            <p style={{ color: "var(--steam-muted)", fontSize: "13px" }}>{user?.major}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "24px", textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#fff" }}>
              {user?.readBooks?.length || 0}
            </div>
            <small style={{ color: "var(--steam-muted)", fontSize: "11px" }}>BOOKS READ</small>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#22c55e" }}>
              {borrowedRecords.length}
            </div>
            <small style={{ color: "var(--steam-muted)", fontSize: "11px" }}>DB LOANS</small>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--steam-orange)" }}>
              {locks.length}
            </div>
            <small style={{ color: "var(--steam-muted)", fontSize: "11px" }}>ACTIVE LOCKS</small>
          </div>
          <div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#f0a500" }}>
              {readlists.length}
            </div>
            <small style={{ color: "var(--steam-muted)", fontSize: "11px" }}>READLISTS</small>
          </div>
        </div>
      </div>

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
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px" }}>
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
                    color: "#fff",
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
                  <h4 style={{ fontSize: "16px", fontWeight: "700", marginTop: "4px" }}>{lock.title}</h4>
                  <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>{lock.author}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#f0a500", marginTop: "8px" }}>
                    <Icon name="pin" size={13} color="#f0a500" />
                    <span>{lock.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleReleaseLock(lock.id)}
                  style={{
                    marginTop: "14px",
                    padding: "8px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid var(--steam-border)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                >
                  Release Hold / Picked Up
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Curate Profile: Books You've Read */}
      <section style={{ marginBottom: "36px" }}>
        <div className="steam-section-head">
          <h2>Books You've Read ({readBooks.length})</h2>
          <span style={{ fontSize: "13px", color: "var(--steam-muted)" }}>
            Used to match you with similar readers
          </span>
        </div>

        {readBooks.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {readBooks.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBook(b.id)}
                style={{
                  background: "#161b22",
                  border: "1px solid var(--steam-border)",
                  borderRadius: "12px",
                  padding: "12px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={b.coverImg}
                  alt={b.title}
                  style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }}
                />
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginTop: "8px" }}>{b.title}</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--steam-muted)" }}>{b.genre}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(b.id);
                    }}
                    style={{ fontSize: "11px", color: "#ef4444" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
            You haven't marked any books as read yet. Browse the store and click "+ Mark as Read"!
          </p>
        )}
      </section>

      {/* Custom Readlists */}
      <section style={{ marginBottom: "36px" }}>
        <div className="steam-section-head">
          <h2>Your Readlists ({readlists.length})</h2>
        </div>

        {/* Create Readlist Form */}
        <form
          onSubmit={handleCreateReadlist}
          style={{
            background: "#161b22",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid var(--steam-border)",
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <input
            type="text"
            placeholder="Readlist Title (e.g. Weekend Deep Dives)"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <input
            type="text"
            placeholder="Short description..."
            value={newListDesc}
            onChange={(e) => setNewListDesc(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #ff6200, #ff4500)",
              borderRadius: "999px",
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "13px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(255, 98, 0, 0.35)",
            }}
          >
            <Icon name="plus" size={15} color="#fff" />
            <span>Create Readlist</span>
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          {readlists.map((list) => (
            <div
              key={list.id}
              style={{
                background: "#161b22",
                border: "1px solid var(--steam-border)",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon name="bookmark" size={16} color="var(--steam-orange)" />
                <span>{list.title}</span>
              </h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted)", margin: "4px 0 12px" }}>
                {list.description}
              </p>
              <div style={{ fontSize: "12px", color: "var(--steam-orange)" }}>
                {list.bookIds?.length || 0} books in readlist
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Book Suggestions for You */}
      <section>
        <div className="steam-section-head">
          <h2>Find Book Suggestions (Curated for You)</h2>
          <button className="steam-link" onClick={() => setActiveTab("books")}>
            View all →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {suggestions.map((b) => (
            <div
              key={b.id}
              onClick={() => onSelectBook(b.id)}
              style={{
                background: "#161b22",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid var(--steam-border)",
                cursor: "pointer",
                display: "flex",
                gap: "14px",
              }}
            >
              <img
                src={b.coverImg}
                alt={b.title}
                style={{ width: "70px", height: "100px", objectFit: "cover", borderRadius: "6px" }}
              />
              <div>
                <span style={{ fontSize: "11px", color: "var(--steam-orange)" }}>{b.genre}</span>
                <h4 style={{ fontSize: "15px", fontWeight: "700", margin: "2px 0" }}>{b.title}</h4>
                <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>{b.author}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#f0a500", marginTop: "8px" }}>
                  <Icon name="star" size={11} color="#f0a500" />
                  <span>{b.rating}</span>
                  <span style={{ margin: "0 4px", color: "var(--steam-border)" }}>•</span>
                  <Icon name="pin" size={11} color="#f0a500" />
                  <span>{b.location.split("·")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
