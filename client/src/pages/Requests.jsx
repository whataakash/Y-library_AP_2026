import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [department, setDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const data = await api.getRequests();
    setRequests(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !author) return;
    await api.submitRequest({ title, author, department, reason });
    setSubmitted(true);
    setTitle("");
    setAuthor("");
    setDepartment("");
    setReason("");
    loadRequests();
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleUpvote = async (id) => {
    const updated = await api.upvoteRequest(id);
    setRequests([...updated]);
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px" }}>
          Request Books from Campus Librarians
        </h2>
        <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
          Can't find a title in the campus catalogue? Request acquisitions directly from the library team.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
        {/* Submission Form */}
        <div
          style={{
            background: "var(--steam-card-bg)",
            border: "1px solid var(--steam-border)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 14px 35px rgba(0, 0, 0, 0.9)",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
            Submit a New Book Request
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "var(--steam-muted)", display: "block", marginBottom: "4px" }}>
                Book Title
              </label>
              <input
                type="text"
                placeholder="e.g. Klara and the Sun"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "var(--steam-muted)", display: "block", marginBottom: "4px" }}>
                Author
              </label>
              <input
                type="text"
                placeholder="e.g. Kazuo Ishiguro"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ width: "100%" }}
                required
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: "var(--steam-muted)", display: "block", marginBottom: "4px" }}>
                Department / Course
              </label>
              <input
                type="text"
                placeholder="e.g. Philosophy / Senior Thesis"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--steam-muted)", display: "block", marginBottom: "4px" }}>
                Reason for Acquisition
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this book is valuable for your research or campus..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: "100%", borderRadius: "10px" }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--steam-orange)",
                borderRadius: "10px",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                boxShadow: "0 6px 18px rgba(255, 42, 42, 0.35)",
              }}
            >
              Send Request to Librarian
            </button>

            {submitted && (
              <div
                style={{
                  marginTop: "12px",
                  color: "#a3e635",
                  fontSize: "13px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Icon name="check" size={14} color="#a3e635" />
                <span>Request submitted to campus acquisitions team!</span>
              </div>
            )}
          </form>
        </div>

        {/* Board of Active Requests */}
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>
            Current Student Requests & Upvotes
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {requests.map((req) => (
              <div
                key={req.id}
                style={{
                  background: "var(--steam-card-bg)",
                  border: "1px solid var(--steam-border)",
                  borderRadius: "14px",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4 style={{ fontSize: "16px", fontWeight: "700" }}>{req.title}</h4>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "rgba(255, 98, 0, 0.15)",
                        color: "var(--steam-orange)",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--steam-muted)", marginTop: "2px" }}>
                    by {req.author} · Requested by {req.requester} ({req.department})
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--steam-text-secondary)", marginTop: "8px" }}>
                    “{req.reason}”
                  </p>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(req.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--steam-border)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--steam-orange)",
                    cursor: "pointer",
                    minWidth: "60px",
                  }}
                >
                  <Icon name="chevronUp" size={16} color="var(--steam-orange)" />
                  <b style={{ fontSize: "14px" }}>{req.votes}</b>
                  <small style={{ fontSize: "9px", color: "var(--steam-muted)" }}>VOTES</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
