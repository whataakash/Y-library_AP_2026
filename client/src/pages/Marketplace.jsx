import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  // New listing state
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState("Signed Copy");
  const [price, setPrice] = useState("");
  const [tradeFor, setTradeFor] = useState("");
  const [condition, setCondition] = useState("Mint Condition");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const data = await api.getMarketplaceListings();
    setListings(data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.createListing({
      title,
      author,
      type,
      price: type === "Barter / Trade" ? 0 : Number(price),
      tradeFor: type === "Barter / Trade" ? tradeFor : null,
      condition,
      notes,
      coverImg: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop",
    });

    setShowModal(false);
    setTitle("");
    setAuthor("");
    setPrice("");
    setNotes("");
    loadListings();
  };

  const filtered = listings.filter((l) => {
    if (filter === "All") return true;
    return l.type === filter;
  });

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px" }}>
            Campus Book Marketplace
          </h2>
          <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
            Buy, Sell, or Barter textbooks, student novels, and authenticated signed copies for a premium.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #FF6F5E, #F95C4B)",
            borderRadius: "10px",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "14px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 16px rgba(249, 92, 75, 0.35)",
          }}
        >
          <Icon name="plus" size={16} color="#fff" />
          <span>List a Book for Sale / Barter</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["All", "Signed Copy", "Barter / Trade", "For Sale"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: "8px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "600",
              background: filter === t ? "var(--steam-orange)" : "#161b22",
              color: filter === t ? "#fff" : "var(--steam-muted)",
              border: "1px solid var(--steam-border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              background: "linear-gradient(180deg, #0d0d11 0%, #040406 100%)",
              border: "1px solid var(--steam-border)",
              borderRadius: "16px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                height: "200px",
                backgroundImage: `url(${item.coverImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  background: item.type === "Signed Copy" ? "#f59e0b" : "var(--steam-orange)",
                  color: "#000",
                  fontWeight: "800",
                  fontSize: "11px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {item.type === "Signed Copy" && <Icon name="star" size={10} color="#000" />}
                <span>{item.type === "Signed Copy" ? "SIGNED COPY" : item.type.toUpperCase()}</span>
              </span>

              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  right: "12px",
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontWeight: "800",
                  fontSize: "14px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {item.type === "Barter / Trade" ? (
                  <>
                    <Icon name="repeat" size={14} color="#fff" />
                    <span>Barter Only</span>
                  </>
                ) : (
                  <span>${item.price} USD</span>
                )}
              </div>
            </div>

            <div style={{ padding: "18px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--steam-muted)", marginBottom: "10px" }}>
                {item.author}
              </p>

              <div style={{ fontSize: "12px", color: "#d0d7de", marginBottom: "8px" }}>
                <b>Condition:</b> {item.condition}
              </div>

              {item.tradeFor && (
                <div style={{ fontSize: "12px", color: "#f0a500", marginBottom: "8px" }}>
                  <b>Wants:</b> {item.tradeFor}
                </div>
              )}

              <p style={{ fontSize: "12px", color: "var(--steam-muted)", flex: 1 }}>{item.notes}</p>

              {/* Seller Pill & Contact */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--steam-border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src={item.sellerAvatar}
                    alt={item.seller}
                    style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                  />
                  <span style={{ fontSize: "11px", color: "var(--steam-muted)" }}>{item.seller}</span>
                </div>

                <button
                  onClick={() => alert(`Contacting seller ${item.seller} via campus student chat!`)}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255, 98, 0, 0.15)",
                    border: "1px solid var(--steam-orange)",
                    color: "var(--steam-orange)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {item.type === "Barter / Trade" ? "Propose Trade" : "Contact Seller"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to Create Listing */}
      {showModal && (
        <div className="steam-modal-veil" onClick={() => setShowModal(false)}>
          <div className="steam-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>
              List a Book on Campus Marketplace
            </h2>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--steam-muted)" }}>Book Title</label>
                <input
                  type="text"
                  placeholder="e.g. The Secret History"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", marginTop: "4px" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--steam-muted)" }}>Author</label>
                <input
                  type="text"
                  placeholder="e.g. Donna Tartt"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{ width: "100%", marginTop: "4px" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "var(--steam-muted)" }}>Listing Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: "100%", marginTop: "4px" }}
                  >
                    <option value="Signed Copy">Signed Copy (Premium)</option>
                    <option value="For Sale">For Sale (Cash/Venmo)</option>
                    <option value="Barter / Trade">Barter / Book Trade</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", color: "var(--steam-muted)" }}>
                    {type === "Barter / Trade" ? "Trade Wishlist" : "Price ($ USD)"}
                  </label>
                  {type === "Barter / Trade" ? (
                    <input
                      type="text"
                      placeholder="e.g. Will trade for sci-fi"
                      value={tradeFor}
                      onChange={(e) => setTradeFor(e.target.value)}
                      style={{ width: "100%", marginTop: "4px" }}
                      required
                    />
                  ) : (
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{ width: "100%", marginTop: "4px" }}
                      required
                    />
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", color: "var(--steam-muted)" }}>Condition & Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Authenticated signed copy, mint condition."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: "10px 18px", color: "var(--steam-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    background: "var(--steam-orange)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontWeight: "700",
                  }}
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
