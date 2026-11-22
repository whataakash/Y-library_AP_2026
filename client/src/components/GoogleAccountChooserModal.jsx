import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export default function GoogleAccountChooserModal({ isOpen, onClose }) {
  const { loginWithGoogle } = useAuth();
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const googleAccounts = [
    {
      name: "Alex Morgan",
      email: "alex.morgan.cs@gmail.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      googleId: "google_1082918392",
    },
    {
      name: "Maya Chen",
      email: "maya.chen.arch@gmail.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      googleId: "google_2091823910",
    },
    {
      name: "Leo Hoffman",
      email: "leo.hoffman.econ@gmail.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      googleId: "google_3918239102",
    },
    {
      name: "Sofia Reyes",
      email: "sofia.reyes.psy@gmail.com",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      googleId: "google_4918239103",
    },
  ];

  const handleSelectGoogleAccount = async (acc) => {
    setLoading(true);
    try {
      await loginWithGoogle(acc);
      onClose();
    } catch (err) {
      alert(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setLoading(true);
    try {
      await loginWithGoogle({
        name: customName.trim() || customEmail.split("@")[0].replace(".", " "),
        email: customEmail.trim(),
        avatar: `https://images.unsplash.com/photo-1534528741775?w=100&h=100&fit=crop`,
        googleId: `google_${Date.now()}`,
      });
      onClose();
    } catch (err) {
      alert(err.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="steam-modal-veil" onClick={onClose}>
      <div
        className="steam-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "460px",
          background: "#ffffff",
          color: "#202124",
          borderRadius: "24px",
          padding: "36px 32px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Google Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", marginBottom: "12px" }}>
            <GoogleLogo size={32} />
          </div>
          <h3 style={{ fontSize: "22px", fontWeight: "600", color: "#202124", marginBottom: "6px" }}>
            Sign in with Google
          </h3>
          <p style={{ fontSize: "14px", color: "#5f6368" }}>
            Choose an account to continue to <b>Y-Library</b>
          </p>
        </div>

        {!showCustomInput ? (
          <div>
            {/* Account List */}
            <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #dadce0", borderBottom: "1px solid #dadce0" }}>
              {googleAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 8px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f3f4",
                    transition: "background-color 0.15s",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#3c4043" }}>
                      {acc.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#5f6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {acc.email}
                    </div>
                  </div>
                </div>
              ))}

              {/* Use Another Account */}
              <div
                onClick={() => setShowCustomInput(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 8px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#f1f3f4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#5f6368",
                    fontSize: "20px",
                  }}
                >
                  +
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a73e8" }}>
                  Use another Google account
                </div>
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", marginTop: "16px", color: "#1a73e8", fontSize: "13px" }}>
                Authenticating with Google...
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "8px 20px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1a73e8",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Custom Google Account Form */
          <form onSubmit={handleCustomGoogleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#5f6368", marginBottom: "4px" }}>
                  Your Google Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Lee"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{
                    width: "100%",
                    color: "#202124",
                    background: "#ffffff",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    padding: "10px 14px",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#5f6368", marginBottom: "4px" }}>
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  style={{
                    width: "100%",
                    color: "#202124",
                    background: "#ffffff",
                    border: "1px solid #dadce0",
                    borderRadius: "4px",
                    padding: "10px 14px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                style={{ color: "#5f6368", fontSize: "13px", background: "none", border: "none", cursor: "pointer" }}
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  borderRadius: "4px",
                  background: "#1a73e8",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {loading ? "Signing in..." : "Continue"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
