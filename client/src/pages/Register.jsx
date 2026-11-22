import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ setActivePage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;
    register(name, email);
    setActivePage("dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <img
          src="/y-lib-logo.svg"
          alt="Y-Library"
          style={{ width: "52px", height: "52px", borderRadius: "12px", margin: "0 auto 12px", display: "block", objectFit: "contain" }}
        />
        <span className="eyebrow">Join the Reading Network</span>
        <h2>Begin your reading life</h2>
        <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "6px" }}>
          Register your campus library identity.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Maya Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>University Email</label>
          <input
            type="email"
            placeholder="student@y-university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Create Password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginTop: "12px" }}
        >
          Create Student Account
        </button>
      </form>

      <div className="auth-switch">
        Already have an account?
        <button onClick={() => setActivePage("login")}>Sign In</button>
      </div>
    </div>
  );
}
