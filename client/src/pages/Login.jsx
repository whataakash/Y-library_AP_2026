import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ setActivePage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    login(email, password);
    setActivePage("dashboard");
  };

  const handleDemoLogin = () => {
    login("maya.chen@y-university.edu", "password123");
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
        <span className="eyebrow">Y—Library Account</span>
        <h2>Return to your shelf</h2>
        <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "6px" }}>
          Sign in with your university credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>University Email</label>
          <input
            type="email"
            placeholder="name@y-university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
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
          Sign In
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: "100%", marginTop: "8px" }}
          onClick={handleDemoLogin}
        >
          One-Click Demo Student Sign In
        </button>
      </form>

      <div className="auth-switch">
        New to Y—Library?
        <button onClick={() => setActivePage("register")}>
          Create account
        </button>
      </div>
    </div>
  );
}
