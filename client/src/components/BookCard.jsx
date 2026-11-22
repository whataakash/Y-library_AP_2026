import { getCoverUrl } from "../services/api";

export default function BookCard({ book, onSelect }) {
  return (
    <div className="book-card" onClick={() => onSelect(book.id)}>
      <div
        className="book-card-cover-wrap"
        style={{ backgroundColor: book.tone || "#1f2530" }}
      >
        <img
          src={getCoverUrl(book.isbn)}
          alt={book.title}
          className="book-card-cover"
          loading="lazy"
          onError={(e) => {
            // Hide broken image so tone color shows
            e.target.style.display = "none";
          }}
        />
        <span className="book-status-badge">{book.status}</span>
        <span className="book-rating-badge">★ {book.rating}</span>
      </div>

      <div className="book-card-info">
        <h4 className="book-card-title">{book.title}</h4>
        <p className="book-card-author">{book.author}</p>
      </div>
    </div>
  );
}
