import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GoogleLogo } from "./GoogleAccountChooserModal";
import GoogleAccountChooserModal from "./GoogleAccountChooserModal";

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithCredentials, registerWithCredentials } = useAuth();
  const [tab, setTab] = useState("login"); // "login" or "register"
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [major, setMajor] = useState("Computer Science & AI");
  const [year, setYear] = useState("Year 1");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (tab === "login") {
        await loginWithCredentials(email, password);
      } else {
        await registerWithCredentials({
          name,
          email,
          password,
          major,
          year,
          preferredGenres: [major.split(" ")[0]],
        });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword = "StudentPass123!") => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginWithCredentials(demoEmail, demoPassword);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="steam-modal-veil" onClick={onClose}>
        <div
          className="steam-modal"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "480px" }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--steam-orange)", textTransform: "uppercase" }}>
                Campus Catalog Authentication
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--steam-text)" }}>
                {tab === "login" ? "Welcome Back to Y-Library" : "Join Y-Library"}
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

          {/* Google Sign-In Button */}
          <button
            onClick={() => setIsGoogleModalOpen(true)}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#3c4043",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              border: "1px solid #dadce0",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <GoogleLogo size={20} />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              color: "var(--steam-muted)",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "var(--steam-border)" }} />
            <span>Or continue with campus email</span>
            <div style={{ flex: 1, height: "1px", background: "var(--steam-border)" }} />
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--steam-input-bg)",
              padding: "4px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                background: tab === "login" ? "var(--steam-orange)" : "transparent",
                color: tab === "login" ? "#ffffff" : "var(--steam-muted)",
                transition: "all 0.15s",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setErrorMsg("");
              }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                background: tab === "register" ? "var(--steam-orange)" : "transparent",
                color: tab === "register" ? "#ffffff" : "var(--steam-muted)",
                transition: "all 0.15s",
              }}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
              {tab === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Lee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Campus Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@y-university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              {tab === "register" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      Major / Department
                    </label>
                    <select
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      style={{ width: "100%", fontSize: "12px" }}
                    >
                      <option value="Computer Science & AI">Computer Science & AI</option>
                      <option value="Architecture & Urban Design">Architecture & Urban Design</option>
                      <option value="Economics & Finance">Economics & Finance</option>
                      <option value="Psychology & Behavioral Neuroscience">Psychology & Neuroscience</option>
                      <option value="Literature & Philosophy">Literature & Philosophy</option>
                      <option value="General Science & Engineering">Science & Engineering</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      style={{ width: "100%", fontSize: "12px" }}
                    >
                      <option value="Year 1">First Year (Year 1)</option>
                      <option value="Year 2">Sophomore (Year 2)</option>
                      <option value="Year 3">Junior (Year 3)</option>
                      <option value="Year 4">Senior (Year 4)</option>
                      <option value="Postgraduate">Graduate / PhD</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  fontSize: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                ⚠ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="steam-btn-primary"
              style={{ width: "100%", padding: "12px" }}
            >
              {loading
                ? "Processing..."
                : tab === "login"
                ? "Sign In to Campus Catalog"
                : "Create Student Account"}
            </button>
          </form>

          {/* Quick Demo Role Sign-In for Faculty & Presentation */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px solid var(--steam-border)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--steam-muted)", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
              <span>DEMO: 1-CLICK ROLE SIGN-IN</span>
              <span style={{ color: "var(--steam-orange)" }}>Bcrypt Encrypted</span>
            </div>
            
            {/* Admins */}
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#ef4444", marginBottom: "4px" }}>
              👑 ADMINISTRATORS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("arthur.vance@y-university.edu", "AdminPassword123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Dr. Vance (Dean)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("elena.rostova@y-university.edu", "AdminPassword123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Elena Rostova (SysDir)
              </button>
            </div>

            {/* Librarians */}
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#38bdf8", marginBottom: "4px" }}>
              📚 LIBRARIANS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("margaret.hollowell@y-university.edu", "LibrarianPass123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1px solid rgba(14, 165, 233, 0.25)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Margaret H. (Collections)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("samuel.thorne@y-university.edu", "LibrarianPass123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1px solid rgba(14, 165, 233, 0.25)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Samuel Thorne (Circulation)
              </button>
            </div>

            {/* Students */}
            <div style={{ fontSize: "10px", fontWeight: "700", color: "#fbbf24", marginBottom: "4px" }}>
              🎓 STUDENTS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleDemoLogin("alex.morgan@y-university.edu", "StudentPass123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "var(--steam-input-bg)",
                  border: "1px solid var(--steam-border)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Alex Morgan (CS & AI)
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("maya.chen@y-university.edu", "StudentPass123!")}
                style={{
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "var(--steam-input-bg)",
                  border: "1px solid var(--steam-border)",
                  color: "var(--steam-text)",
                  fontSize: "11px",
                  fontWeight: "600",
                  textAlign: "left",
                }}
              >
                Maya Chen (Arch)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Google Account Chooser */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => {
          setIsGoogleModalOpen(false);
          onClose();
        }}
      />
    </>
  );
}
