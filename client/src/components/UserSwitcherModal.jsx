import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icon";

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

export default function UserSwitcherModal({ isOpen, onClose }) {
  const {
    user,
    users,
    switchUser,
    updateUserProfile,
    toggleGenrePreference,
    createUserProfile,
  } = useAuth();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMajor, setNewMajor] = useState("");
  const [newYear, setNewYear] = useState("Year 1");
  const [selectedGenres, setSelectedGenres] = useState(["Technology", "Science"]);

  if (!isOpen) return null;

  const handleSelectUser = (id) => {
    switchUser(id);
    onClose();
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createUserProfile({
      name: newName,
      major: newMajor || "General Studies",
      year: newYear,
      preferredGenres: selectedGenres,
    });

    setIsCreating(false);
    setNewName("");
    setNewMajor("");
    onClose();
  };

  const toggleNewGenre = (g) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
    );
  };

  return (
    <div className="steam-modal-veil" onClick={onClose}>
      <div
        className="steam-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "620px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "1px solid var(--steam-border)",
            paddingBottom: "14px",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--steam-orange)", textTransform: "uppercase" }}>
              Personalization Engine
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--steam-text)" }}>
              {isCreating ? "Create Student Profile" : "Switch Student Persona"}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--steam-muted)",
              fontSize: "18px",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            ✕
          </button>
        </div>

        {!isCreating ? (
          <div>
            <p style={{ color: "var(--steam-muted)", fontSize: "13px", marginBottom: "16px" }}>
              Select a student to see how the home catalog, recommendations, reading progress, and shelves instantly re-personalize:
            </p>

            {/* List of Student Profiles */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {users.map((u) => {
                const isActive = u.id === user.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: isActive
                        ? "1.5px solid var(--steam-orange)"
                        : "1px solid var(--steam-border)",
                      background: isActive
                        ? "rgba(255, 85, 0, 0.08)"
                        : "var(--steam-panel)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: isActive ? "2px solid var(--steam-orange)" : "1px solid var(--steam-border)",
                        }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--steam-text)" }}>
                            {u.name}
                          </span>
                          {isActive && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                background: "var(--steam-orange)",
                                color: "#ffffff",
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--steam-muted)", marginTop: "2px" }}>
                          {u.major} • {u.year}
                        </div>
                        {/* Preferred Genres chips */}
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" }}>
                          {(u.preferredGenres || []).slice(0, 3).map((g) => (
                            <span
                              key={g}
                              style={{
                                fontSize: "10px",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                background: "var(--steam-input-bg)",
                                border: "1px solid var(--steam-border)",
                                color: "var(--steam-text-secondary)",
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "12px", color: "var(--steam-muted)" }}>
                        {(u.continueReading || []).length} Reading
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--steam-orange)", fontWeight: "600", marginTop: "2px" }}>
                        {(u.favorites || []).length} Saved
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Student Interests Editor */}
            <div
              style={{
                background: "var(--steam-input-bg)",
                border: "1px solid var(--steam-border)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--steam-text)" }}>
                  Personalized Reading Interests for {user.name}
                </span>
                <span style={{ fontSize: "11px", color: "var(--steam-muted)" }}>
                  Click to add/remove
                </span>
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {ALL_GENRES.map((g) => {
                  const isSelected = (user.preferredGenres || []).includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => toggleGenrePreference(g)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: isSelected
                          ? "linear-gradient(135deg, #FF6F5E, #F95C4B)"
                          : "var(--steam-panel)",
                        color: isSelected ? "#ffffff" : "var(--steam-muted)",
                        border: isSelected
                          ? "1px solid var(--steam-orange)"
                          : "1px solid var(--steam-border)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setIsCreating(true)}
                className="steam-btn-primary"
                style={{
                  background: "var(--steam-input-bg)",
                  border: "1px solid var(--steam-border)",
                  color: "var(--steam-text)",
                  boxShadow: "none",
                }}
              >
                + Add Custom Student Persona
              </button>
              <button
                onClick={onClose}
                className="steam-btn-primary"
                style={{ flex: 1 }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Create Student Profile Form */
          <form onSubmit={handleCreateSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                    Major / Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Science, History..."
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "6px" }}>
                    Academic Year
                  </label>
                  <select
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    style={{ width: "100%" }}
                  >
                    <option value="Year 1">First Year (Year 1)</option>
                    <option value="Year 2">Sophomore (Year 2)</option>
                    <option value="Year 3">Junior (Year 3)</option>
                    <option value="Year 4">Senior (Year 4)</option>
                    <option value="Postgraduate">Graduate / PhD</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>
                  Select Preferred Reading Genres
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {ALL_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => toggleNewGenre(g)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: isSelected
                            ? "linear-gradient(135deg, #FF6F5E, #F95C4B)"
                            : "var(--steam-input-bg)",
                          color: isSelected ? "#ffffff" : "var(--steam-muted)",
                          border: isSelected
                            ? "1px solid var(--steam-orange)"
                            : "1px solid var(--steam-border)",
                        }}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                style={{
                  padding: "12px 18px",
                  borderRadius: "10px",
                  border: "1px solid var(--steam-border)",
                  color: "var(--steam-muted)",
                }}
              >
                Back
              </button>
              <button type="submit" className="steam-btn-primary" style={{ flex: 1 }}>
                Save & Personalize Catalog
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
