const GENRES = [
  "All",
  "Fiction",
  "Art & Design",
  "Philosophy",
  "Sci-Fi",
  "Nature",
  "History",
];

export default function SearchBar({
  query,
  onQueryChange,
  selectedGenre,
  onGenreChange,
}) {
  return (
    <div className="search-container">
      {/* Search Input Box */}
      <div className="search-input-wrap">
        <input
          type="text"
          className="search-input"
          placeholder="Search by title, author, or ISBN..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button
            className="btn btn-secondary"
            onClick={() => onQueryChange("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Genre Filter Tags */}
      <div className="genre-tags">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`genre-tag ${selectedGenre === genre ? "active" : ""}`}
            onClick={() => onGenreChange(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
