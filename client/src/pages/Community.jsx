import { useState, useEffect } from "react";
import { api } from "../services/api";
import Icon from "../components/Icon";

export default function Community({ onSelectBook }) {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    api.getCommunityPeople().then(setPeople);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "6px" }}>
          Find People Who’ve Read Similar Books
        </h2>
        <p style={{ color: "var(--steam-muted)", fontSize: "14px" }}>
          Connect with campus readers based on shared library borrowing history and mutual reading taste.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {people.map((person) => (
          <div
            key={person.id}
            style={{
              background: "linear-gradient(180deg, #0d0d11 0%, #040406 100%)",
              border: "1px solid var(--steam-border)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div>
              {/* Header with Avatar and Match Score */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                  <img
                    src={person.avatar}
                    alt={person.name}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--steam-border)",
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: "17px", fontWeight: "700" }}>{person.name}</h3>
                    <p style={{ fontSize: "12px", color: "var(--steam-muted)" }}>{person.major}</p>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid #22c55e",
                    color: "#22c55e",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontWeight: "800",
                    fontSize: "12px",
                  }}
                >
                  {person.match} Match
                </div>
              </div>

              {/* Shared Books List */}
              <div style={{ marginTop: "16px" }}>
                <span style={{ fontSize: "11px", color: "var(--steam-muted)", fontWeight: "700" }}>
                  SHARED BOOKS YOU BOTH READ:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {person.sharedBooks?.map((b) => (
                    <span
                      key={b}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(255, 98, 0, 0.12)",
                        color: "var(--steam-orange)",
                        fontSize: "12px",
                        fontWeight: "500",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Icon name="book" size={13} color="var(--steam-orange)" />
                      <span>{b}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Review Quote */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 14px",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontStyle: "italic",
                  color: "#c9d1d9",
                }}
              >
                “{person.recentReview}”
              </div>
            </div>

            {/* Connect Button */}
            <button
              onClick={() => alert(`Reading circle invite sent to ${person.name}!`)}
              style={{
                marginTop: "20px",
                padding: "10px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--steam-border)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Icon name="chat" size={15} color="#fff" />
              <span>Invite to Reading Circle</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
