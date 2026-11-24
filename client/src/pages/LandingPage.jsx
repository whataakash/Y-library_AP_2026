import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

export default function LandingPage({ defaultOpenAuth = false }) {
  const { loginWithCredentials } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(defaultOpenAuth);
  const [loadingRole, setLoadingRole] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleQuickLogin = async (email, password, roleLabel) => {
    setErrorMsg("");
    setLoadingRole(roleLabel);
    try {
      await loginWithCredentials(email, password);
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Please try again.");
      setLoadingRole(null);
    }
  };

  const PREVIEW_BOOKS = [
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      genre: "Economics",
      location: "Central Library / A-01",
      rating: "4.5",
      cover: "https://covers.openlibrary.org/b/id/10389354-L.jpg",
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Technology",
      location: "Central Library / B-02",
      rating: "4.8",
      cover: "https://covers.openlibrary.org/b/id/1094406-L.jpg",
    },
    {
      title: "Thinking, Fast and Slow",
      author: "Daniel Kahneman",
      genre: "Psychology",
      location: "Central Library / B-02",
      rating: "4.6",
      cover: "https://covers.openlibrary.org/b/id/13290711-L.jpg",
    },
    {
      title: "Zero to One",
      author: "Peter Thiel",
      genre: "Business",
      location: "Central Library / D-02",
      rating: "4.4",
      cover: "https://covers.openlibrary.org/b/id/9002334-L.jpg",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--steam-bg, #0b0f19)",
        color: "var(--steam-text, #f1f5f9)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* 1. Header / Navbar */}
      <header
        style={{
          borderBottom: "1px solid var(--steam-border, #1e293b)",
          background: "rgba(11, 15, 25, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/y-lib-logo.svg"
            alt="Y-Library Logo"
            style={{ width: "36px", height: "36px", borderRadius: "8px" }}
          />
          <div>
            <div style={{ fontWeight: "800", fontSize: "18px", letterSpacing: "-0.5px" }}>
              Y—LIBRARY
            </div>
            <div style={{ fontSize: "11px", color: "var(--steam-muted, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Campus Knowledge Hub
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => {
              const el = document.getElementById("demo-roles-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid var(--steam-border, #334155)",
              color: "var(--steam-text, #f1f5f9)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Demo Accounts
          </button>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              background: "var(--steam-orange)",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Sign In / Register
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section
        style={{
          padding: "80px 24px 60px",
          maxWidth: "1100px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: "999px",
            background: "#241D44",
            border: "1px solid #45367A",
            color: "#D6CAFC",
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "20px",
          }}
        >
          University Campus Library Management System
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "900",
            letterSpacing: "-1.5px",
            lineHeight: "1.1",
            marginBottom: "24px",
          }}
        >
          Your Academic Library,{" "}
          <span style={{ color: "var(--steam-orange, #ff5500)" }}>Reimagined.</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "var(--steam-muted, #94a3b8)",
            maxWidth: "720px",
            margin: "0 auto 36px",
            lineHeight: "1.6",
          }}
        >
          Explore over <strong>900+ physical catalog books</strong> across 14 genres, track live shelf coordinates, check out loans with 14-day return reminders, and personalize your reading goals with secure <strong>bcrypt authentication</strong>.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              fontSize: "14px",
              maxWidth: "500px",
              margin: "0 auto 20px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            style={{
              padding: "14px 28px",
              borderRadius: "10px",
              background: "var(--steam-orange)",
              border: "none",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Sign In to Access Library →
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("demo-roles-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "14px 24px",
              borderRadius: "10px",
              background: "var(--steam-panel, #1e293b)",
              border: "1px solid var(--steam-border, #334155)",
              color: "var(--steam-text, #f1f5f9)",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Choose a Demo Role (1-Click)
          </button>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginTop: "60px",
            padding: "24px",
            borderRadius: "16px",
            background: "var(--steam-panel, #131b2e)",
            border: "1px solid var(--steam-border, #1e293b)",
          }}
        >
          <div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "var(--steam-orange, #ff5500)" }}>900+</div>
            <div style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)" }}>Physical Books Cataloged</div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#38bdf8" }}>14</div>
            <div style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)" }}>Academic Genres</div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#4ade80" }}>14 Days</div>
            <div style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)" }}>Automated Loan Window</div>
          </div>
          <div>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#c084fc" }}>3 Roles</div>
            <div style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)" }}>Admin, Librarian, Student</div>
          </div>
        </div>
      </section>

      {/* 3. Demo Roles Section (1-Click Login for Faculty Review) */}
      <section
        id="demo-roles-section"
        style={{
          padding: "60px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--steam-orange, #ff5500)", textTransform: "uppercase" }}>
            Faculty & Presentation Mode
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: "800", marginTop: "4px" }}>
            Select a Demo Role to Enter
          </h2>
          <p style={{ color: "var(--steam-muted, #94a3b8)", fontSize: "15px", marginTop: "8px" }}>
            Passwords are encrypted using <strong>bcrypt</strong>. Click any user to log in and unlock the full system:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Card 1: Administrators */}
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "var(--steam-panel, #131b2e)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>👑</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    background: "rgba(239, 68, 68, 0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  ADMINISTRATOR
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
                Campus Administration
              </h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)", lineHeight: "1.5", marginBottom: "20px" }}>
                Full system oversight, system audit logs, inventory monitoring, and platform settings.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("arthur.vance@y-university.edu", "AdminPassword123!", "vance")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Dr. Arthur Vance (Dean)</span>
                <span style={{ fontSize: "11px", color: "#f87171" }}>
                  {loadingRole === "vance" ? "Signing In..." : "Log In →"}
                </span>
              </button>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("elena.rostova@y-university.edu", "AdminPassword123!", "rostova")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Elena Rostova (SysDirector)</span>
                <span style={{ fontSize: "11px", color: "#f87171" }}>
                  {loadingRole === "rostova" ? "Signing In..." : "Log In →"}
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Librarians */}
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "var(--steam-panel, #131b2e)",
              border: "1px solid rgba(14, 165, 233, 0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>📚</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    background: "rgba(14, 165, 233, 0.15)",
                    color: "#38bdf8",
                    border: "1px solid rgba(14, 165, 233, 0.4)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  LIBRARIAN
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
                Library Operations
              </h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)", lineHeight: "1.5", marginBottom: "20px" }}>
                Catalog shelving, managing circulation loans, processing returns, and tracking physical copies.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("margaret.hollowell@y-university.edu", "LibrarianPass123!", "hollowell")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(14, 165, 233, 0.1)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Margaret H. (Collections)</span>
                <span style={{ fontSize: "11px", color: "#38bdf8" }}>
                  {loadingRole === "hollowell" ? "Signing In..." : "Log In →"}
                </span>
              </button>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("samuel.thorne@y-university.edu", "LibrarianPass123!", "thorne")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(14, 165, 233, 0.1)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Samuel Thorne (Circulation)</span>
                <span style={{ fontSize: "11px", color: "#38bdf8" }}>
                  {loadingRole === "thorne" ? "Signing In..." : "Log In →"}
                </span>
              </button>
            </div>
          </div>

          {/* Card 3: Students */}
          <div
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "var(--steam-panel, #131b2e)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "28px" }}>🎓</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  STUDENT (5 PROFILES)
                </span>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "6px" }}>
                Student Personas
              </h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)", lineHeight: "1.5", marginBottom: "20px" }}>
                Personalized home feeds, reading streaks, 1-click book checkouts, and bookmarks.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("alex.morgan@y-university.edu", "StudentPass123!", "alex")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Alex Morgan (CS & AI · Yr 4)</span>
                <span style={{ fontSize: "11px", color: "#fbbf24" }}>
                  {loadingRole === "alex" ? "Signing In..." : "Log In →"}
                </span>
              </button>
              <button
                disabled={!!loadingRole}
                onClick={() => handleQuickLogin("maya.chen@y-university.edu", "StudentPass123!", "maya")}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(245, 158, 11, 0.1)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Maya Chen (Architecture · Yr 3)</span>
                <span style={{ fontSize: "11px", color: "#fbbf24" }}>
                  {loadingRole === "maya" ? "Signing In..." : "Log In →"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Preview Books Catalog */}
      <section
        style={{
          padding: "60px 24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "800" }}>Featured Academic Catalog</h2>
          <p style={{ color: "var(--steam-muted, #94a3b8)", fontSize: "14px", marginTop: "4px" }}>
            Real books with verified ISBNs, covers, and shelf coordinates:
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {PREVIEW_BOOKS.map((b, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "12px",
                background: "var(--steam-panel, #131b2e)",
                border: "1px solid var(--steam-border, #1e293b)",
                overflow: "hidden",
                padding: "16px",
                textAlign: "left",
              }}
            >
              <img
                src={b.cover}
                alt={b.title}
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              />
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--steam-orange, #ff5500)", textTransform: "uppercase" }}>
                {b.genre}
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", margin: "4px 0" }}>
                {b.title}
              </div>
              <div style={{ fontSize: "13px", color: "var(--steam-muted, #94a3b8)" }}>
                {b.author}
              </div>
              <div style={{ fontSize: "11px", color: "var(--steam-muted, #64748b)", marginTop: "8px" }}>
                📍 {b.location}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--steam-border, #1e293b)",
          padding: "36px 24px",
          textAlign: "center",
          color: "var(--steam-muted, #94a3b8)",
          fontSize: "13px",
        }}
      >
        <div>
          © {new Date().getFullYear()} Y-Library Campus Management System · Applied Programming Capstone
        </div>
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--steam-muted, #64748b)" }}>
          Built with React 19, Express.js, Prisma ORM, and PostgreSQL. Securely powered by bcrypt encryption.
        </div>
      </footer>

      {/* Auth Modal for Custom Credentials */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
