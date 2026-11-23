export default function Footer() {
  return (
    <footer className="footer" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <img
        src="/y-lib-logo.svg"
        alt="Y-Library"
        style={{ width: "36px", height: "36px", borderRadius: "8px", marginBottom: "12px", objectFit: "contain" }}
      />
      <p className="footer-quote">
        “A library is not a luxury but one of the necessities of life.”
      </p>
      <p style={{ marginBottom: "12px" }}>
        © {new Date().getFullYear()} Y—Library Campus Reading Network · Connecting students & ideas.
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          fontSize: "12px",
          color: "var(--muted)",
        }}
      >
        <span>Main Library: Open 24/7</span>
        <span>East Wing: 8am - 11pm</span>
        <span>Ask a Librarian: Level 1 Desk</span>
      </div>
      <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--muted)" }}>
        Central Library Desk: Mon–Fri 8:00 AM – 9:00 PM · Level 1 Help Center
      </p>
    </footer>
  );
}
