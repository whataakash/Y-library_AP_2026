// ============================================================
// Y-LIBRARY DISPLAY FORMATTERS
// Formats book titles and author names into elegant capitalized Title Case
// for display to users across the UI.
// ============================================================

const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor",
  "on", "at", "to", "from", "by", "with", "in", "of", "as"
]);

/**
 * Capitalizes a book title into proper Title Case for user display.
 * E.g., "the psychology of money" -> "The Psychology of Money"
 *       "skin in the game" -> "Skin in the Game"
 *       "sapiens: a brief history of humankind" -> "Sapiens: A Brief History of Humankind"
 *       "rich dad poor dad" -> "Rich Dad Poor Dad"
 */
export function capitalizeTitle(str) {
  if (!str || typeof str !== "string") return "";

  const words = str.toLowerCase().split(/\s+/);

  return words
    .map((word, idx) => {
      if (!word) return "";

      // Find first alphabetic character in the token (handles parentheses, quotes)
      const match = word.match(/[a-zA-Z]/);
      if (!match) return word;
      const idxLetter = match.index;

      const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
      const prevEndsWithColon = idx > 0 && words[idx - 1].endsWith(":");

      // Keep minor words in lowercase unless it is the first word or follows a colon
      if (idx > 0 && !prevEndsWithColon && MINOR_WORDS.has(cleanWord)) {
        return word;
      }

      return (
        word.slice(0, idxLetter) +
        word.charAt(idxLetter).toUpperCase() +
        word.slice(idxLetter + 1)
      );
    })
    .join(" ");
}

/**
 * Capitalizes an author name for user display.
 * E.g., "morgan housel" -> "Morgan Housel"
 *       "yuval noah harari" -> "Yuval Noah Harari"
 *       "robert t. kiyosaki" -> "Robert T. Kiyosaki"
 */
export function capitalizeAuthor(str) {
  if (!str || typeof str !== "string") return "";

  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word) => {
      if (!word) return "";
      const match = word.match(/[a-zA-Z]/);
      if (!match) return word;
      const idxLetter = match.index;

      return (
        word.slice(0, idxLetter) +
        word.charAt(idxLetter).toUpperCase() +
        word.slice(idxLetter + 1)
      );
    })
    .join(" ");
}
