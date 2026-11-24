import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

export default function AdminPortal() {
  const { user, switchUser, users } = useAuth();
  const isAdmin = user?.role === "admin";
  const isLibrarian = user?.role === "librarian";
  const isAuthorized = isAdmin || isLibrarian;

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Editing state
  const [editingBook, setEditingBook] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    genre: "",
    location: "",
    total_count: 1,
    available_count: 1,
    rating: "4.5",
  });

  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    bookname: "",
    author: "",
    isbn: "",
    genre: "Technology",
    location: "Central Library / A-01",
    total_count: 5,
    available_count: 5,
    rating: 4.5,
    edition: "1st Campus Edition",
    tags: ["academic", "campus", "coursework"],
  });

  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    loadBooks();
  }, [selectedGenre]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const list = await api.getBooks(searchTerm, selectedGenre);
      setBooks(list || []);
    } catch (e) {
      console.warn("Failed to load catalog:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBooks();
  };

  // Open edit modal
  const handleStartEdit = (b) => {
    setEditingBook(b);
    setEditForm({
      title: b.title || b.bookname || "",
      author: b.author || "",
      genre: b.genre || "General",
      location: b.location || "Central Library / A-01",
      total_count: b.totalCopies || b.total_count || 1,
      available_count: b.copies || b.available_count || 1,
      rating: b.rating || "4.5",
    });
  };

  // Save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    try {
      await api.updateBook(editingBook.id, {
        bookname: editForm.title,
        author: editForm.author,
        genre: editForm.genre,
        location: editForm.location,
        total_count: parseInt(editForm.total_count, 10),
        available_count: parseInt(editForm.available_count, 10),
        rating: parseFloat(editForm.rating),
      });

      setActionMsg(`✓ Book "${editForm.title}" successfully updated!`);
      setEditingBook(null);
      loadBooks();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      alert("Failed to update book: " + err.message);
    }
  };

  // Delete book (Admin only)
  const handleDeleteBook = async (id, title) => {
    if (!isAdmin) {
      alert("Only Administrators have permission to delete books.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${title}" from the catalog?`)) {
      return;
    }

    try {
      await api.deleteBook(id);
      setActionMsg(`✓ Book "${title}" removed from catalog.`);
      loadBooks();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // Add new book
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!addForm.bookname || !addForm.author || !addForm.isbn) {
      alert("Title, Author, and ISBN are required.");
      return;
    }

    try {
      await api.createBook({
        bookname: addForm.bookname,
        author: addForm.author,
        isbn: addForm.isbn,
        genre: addForm.genre,
        location: addForm.location,
        total_count: parseInt(addForm.total_count, 10),
        available_count: parseInt(addForm.available_count, 10),
        rating: parseFloat(addForm.rating),
        edition: addForm.edition,
        book_image: "https://covers.openlibrary.org/b/id/10389354-L.jpg",
        tags: addForm.tags,
      });

      setActionMsg(`✓ New book "${addForm.bookname}" added to catalog!`);
      setIsAdding(false);
      setAddForm({
        bookname: "",
        author: "",
        isbn: "",
        genre: "Technology",
        location: "Central Library / A-01",
        total_count: 5,
        available_count: 5,
        rating: 4.5,
        edition: "1st Campus Edition",
        tags: ["academic", "campus", "coursework"],
      });
      loadBooks();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      alert("Failed to add book: " + err.message);
    }
  };

  // Unauthorized Student View with 1-Click Role Elevation
  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: "700px", margin: "60px auto", padding: "32px", textAlign: "center", background: "var(--steam-panel)", borderRadius: "16px", border: "1px solid var(--steam-border)" }}>
        <div style={{ fontSize: "42px", marginBottom: "16px" }}>🔒</div>
        <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--steam-text)" }}>
          Administrator & Librarian Access Required
        </h2>
        <p style={{ color: "var(--steam-muted)", fontSize: "14px", margin: "12px 0 24px", lineHeight: "1.6" }}>
          You are currently signed in as <strong>{user?.name}</strong> (Role: <span style={{ color: "var(--steam-orange)", fontWeight: "700" }}>STUDENT</span>). Editing catalog metadata, adjusting shelf locations, and removing books require Admin or Librarian credentials.
        </p>

        <div style={{ borderTop: "1px solid var(--steam-border)", paddingTop: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--steam-muted)", marginBottom: "12px", fontWeight: "700" }}>
            FACULTY DEMO: 1-CLICK ROLE SWITCH
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => switchUser("arthur.vance@y-university.edu")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #ef4444",
                color: "#fca5a5",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              👑 Switch to Dr. Arthur Vance (Admin)
            </button>
            <button
              onClick={() => switchUser("margaret.hollowell@y-university.edu")}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                background: "rgba(14, 165, 233, 0.15)",
                border: "1px solid #38bdf8",
                color: "#7dd3fc",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              📚 Switch to Margaret H. (Librarian)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "900", color: "var(--steam-text)" }}>
              {isAdmin ? "👑 Campus Administration Portal" : "📚 Librarian Inventory Portal"}
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                padding: "3px 8px",
                borderRadius: "6px",
                background: isAdmin ? "rgba(239, 68, 68, 0.18)" : "rgba(14, 165, 233, 0.18)",
                color: isAdmin ? "#ef4444" : "#38bdf8",
                border: isAdmin ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid rgba(14, 165, 233, 0.4)",
              }}
            >
              {isAdmin ? "FULL ADMIN PRIVILEGES" : "LIBRARIAN INVENTORY ACCESS"}
            </span>
          </div>
          <p style={{ color: "var(--steam-muted)", fontSize: "14px", marginTop: "4px" }}>
            Managing catalog metadata, physical shelf locations, book copies, and deletion controls. Signed in as <strong>{user?.name}</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "var(--steam-orange)",
            border: "none",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          + Add New Book to Catalog
        </button>
      </div>

      {actionMsg && (
        <div style={{ padding: "12px 18px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.15)", border: "1px solid #22c55e", color: "#86efac", fontSize: "14px", fontWeight: "600", marginBottom: "20px" }}>
          {actionMsg}
        </div>
      )}

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div style={{ padding: "18px", borderRadius: "12px", background: "var(--steam-panel)", border: "1px solid var(--steam-border)" }}>
          <div style={{ fontSize: "12px", color: "var(--steam-muted)", fontWeight: "700", textTransform: "uppercase" }}>Total Titles</div>
          <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--steam-orange)", marginTop: "4px" }}>{books.length}</div>
        </div>
        <div style={{ padding: "18px", borderRadius: "12px", background: "var(--steam-panel)", border: "1px solid var(--steam-border)" }}>
          <div style={{ fontSize: "12px", color: "var(--steam-muted)", fontWeight: "700", textTransform: "uppercase" }}>Admin Role</div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: isAdmin ? "#ef4444" : "#38bdf8", marginTop: "8px" }}>
            {isAdmin ? "Dr. Arthur Vance (Dean)" : "Margaret H. (Collections)"}
          </div>
        </div>
        <div style={{ padding: "18px", borderRadius: "12px", background: "var(--steam-panel)", border: "1px solid var(--steam-border)" }}>
          <div style={{ fontSize: "12px", color: "var(--steam-muted)", fontWeight: "700", textTransform: "uppercase" }}>Edit Capabilities</div>
          <div style={{ fontSize: "13px", color: "var(--steam-text-secondary)", marginTop: "6px" }}>
            {isAdmin ? "✓ Title, Author, Shelf, Copies, Delete" : "✓ Shelf Locations, Stock Counts"}
          </div>
        </div>
        <div style={{ padding: "18px", borderRadius: "12px", background: "var(--steam-panel)", border: "1px solid var(--steam-border)" }}>
          <div style={{ fontSize: "12px", color: "var(--steam-muted)", fontWeight: "700", textTransform: "uppercase" }}>Database Engine</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#22c55e", marginTop: "6px" }}>
            PostgreSQL 18 + Prisma ORM
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by title, author, or ISBN to edit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--steam-input-bg)",
            border: "1px solid var(--steam-border)",
            color: "var(--steam-text)",
          }}
        />
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--steam-input-bg)",
            border: "1px solid var(--steam-border)",
            color: "var(--steam-text)",
          }}
        >
          <option value="All">All Academic Genres</option>
          <option value="Economics">Economics</option>
          <option value="Philosophy">Philosophy</option>
          <option value="Technology">Technology</option>
          <option value="Science">Science</option>
          <option value="Business">Business</option>
          <option value="History">History</option>
        </select>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "var(--steam-panel-hover)",
            border: "1px solid var(--steam-border)",
            color: "var(--steam-text)",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Filter Catalog
        </button>
      </form>

      {/* Catalog Management Table */}
      <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--steam-border)", background: "var(--steam-panel)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid var(--steam-border)", color: "var(--steam-muted)" }}>
              <th style={{ padding: "14px 16px" }}>Book</th>
              <th style={{ padding: "14px 16px" }}>Genre</th>
              <th style={{ padding: "14px 16px" }}>Physical Shelf</th>
              <th style={{ padding: "14px 16px" }}>Stock (Avail/Total)</th>
              <th style={{ padding: "14px 16px" }}>Rating</th>
              <th style={{ padding: "14px 16px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "var(--steam-muted)" }}>
                  Loading catalog inventory...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "var(--steam-muted)" }}>
                  No books found matching query.
                </td>
              </tr>
            ) : (
              books.slice(0, 30).map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--steam-border)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: "700", color: "var(--steam-text)" }}>{b.title || b.bookname}</div>
                    <div style={{ fontSize: "11px", color: "var(--steam-muted)" }}>{b.author} · ISBN: {b.isbn}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", background: "var(--steam-input-bg)", color: "var(--steam-text-secondary)" }}>
                      {b.genre}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#38bdf8", fontWeight: "600" }}>
                    📍 {b.location}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: (b.copies ?? b.available_count ?? 1) > 0 ? "#4ade80" : "#ef4444", fontWeight: "700" }}>
                      {b.copies ?? b.available_count ?? 1}
                    </span>{" "}
                    / {b.totalCopies ?? b.total_count ?? 1}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#fbbf24" }}>
                    ★ {b.rating || "4.5"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        onClick={() => handleStartEdit(b)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "rgba(59, 130, 246, 0.15)",
                          border: "1px solid rgba(59, 130, 246, 0.4)",
                          color: "#60a5fa",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title || b.bookname)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            color: "#f87171",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="steam-modal-veil" onClick={() => setEditingBook(null)}>
          <div className="steam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--steam-text)" }}>
                {isAdmin ? "👑 Admin: Edit Book Details" : "📚 Librarian: Edit Shelf & Inventory"}
              </h3>
              <button onClick={() => setEditingBook(null)} style={{ color: "var(--steam-muted)", fontSize: "16px" }}>✕</button>
            </div>

            <form onSubmit={handleSaveEdit}>
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

              {/* Both Admin and Librarian can edit shelf coordinates and stock */}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.total_count}
                    onChange={(e) => setEditForm({ ...editForm, total_count: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.available_count}
                    onChange={(e) => setEditForm({ ...editForm, available_count: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
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

      {/* Add New Book Modal */}
      {isAdding && (
        <div className="steam-modal-veil" onClick={() => setIsAdding(false)}>
          <div className="steam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--steam-text)" }}>
                Add New Physical Book to Catalog
              </h3>
              <button onClick={() => setIsAdding(false)} style={{ color: "var(--steam-muted)", fontSize: "16px" }}>✕</button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Algorithms"
                  value={addForm.bookname}
                  onChange={(e) => setAddForm({ ...addForm, bookname: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Author(s)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas H. Cormen"
                    value={addForm.author}
                    onChange={(e) => setAddForm({ ...addForm, author: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>ISBN</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9780262033848"
                    value={addForm.isbn}
                    onChange={(e) => setAddForm({ ...addForm, isbn: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Genre</label>
                  <input
                    type="text"
                    required
                    value={addForm.genre}
                    onChange={(e) => setAddForm({ ...addForm, genre: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Shelf Location</label>
                  <input
                    type="text"
                    required
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addForm.total_count}
                    onChange={(e) => setAddForm({ ...addForm, total_count: e.target.value, available_count: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>Edition</label>
                  <input
                    type="text"
                    value={addForm.edition}
                    onChange={(e) => setAddForm({ ...addForm, edition: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", background: "transparent", border: "1px solid var(--steam-border)", color: "var(--steam-text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "8px", background: "var(--steam-orange)", border: "none", color: "#ffffff", fontWeight: "700" }}
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
