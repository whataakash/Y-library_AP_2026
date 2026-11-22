// ============================================================
// Y-LIBRARY PERSONALIZATION ENGINE
// Clean, transparent recommendation algorithms for university students
// Easy to explain to faculty and examiners
// ============================================================

/**
 * Keywords associated with different university majors & departments.
 * Used to calculate departmental relevance scores.
 */
export const MAJOR_KEYWORDS = {
  "Computer Science & AI": [
    "technology", "computer science", "artificial intelligence", "programming",
    "software", "algorithms", "data", "machine learning", "python", "code", "cyber"
  ],
  "Architecture & Urban Design": [
    "architecture", "design", "urban", "building", "space", "form",
    "history", "art", "structural", "drawing", "aesthetics"
  ],
  "Economics & Finance": [
    "economics", "finance", "money", "markets", "business", "capital",
    "management", "trade", "banking", "behavioral", "wealth"
  ],
  "Psychology & Behavioral Neuroscience": [
    "psychology", "cognition", "brain", "neuroscience", "behavior",
    "mental health", "thinking", "memory", "perception", "mind"
  ],
  "Literature & Philosophy": [
    "philosophy", "literature", "classics", "fiction", "poetry",
    "ethics", "metaphysics", "novels", "existentialism", "critique"
  ],
  "General Science & Engineering": [
    "science", "physics", "chemistry", "biology", "engineering",
    "mathematics", "astronomy", "research", "experiment"
  ],
};

/**
 * 1. CALCULATE MATCH SCORE (0 to 100)
 * Evaluates how strongly a book matches a specific student profile.
 * 
 * Scoring Breakdown:
 * - Preferred Genre Match: up to 40 points
 * - Major / Department Keyword Match: up to 30 points
 * - Custom Tag / Interest Match: up to 20 points
 * - High Community Rating: up to 10 points
 */
export function calculateBookMatchScore(user, book) {
  if (!user || !book) return 50;

  let score = 20; // Base score

  const userGenres = (user.preferredGenres || []).map((g) => g.toLowerCase());
  const userInterests = (user.interests || []).map((i) => i.toLowerCase());
  const bookGenre = (book.genre || "").toLowerCase();
  const bookTags = (book.tags || []).map((t) => t.toLowerCase());
  const bookTitle = (book.title || book.bookname || "").toLowerCase();

  // A. Preferred Genre match (+40 points)
  if (userGenres.includes(bookGenre)) {
    score += 40;
  } else if (userGenres.some((g) => bookGenre.includes(g) || g.includes(bookGenre))) {
    score += 25;
  }

  // B. Major / Department Keyword match (+30 points)
  const majorKey = user.major || "";
  const deptKeywords = MAJOR_KEYWORDS[majorKey] || [];
  const matchesMajorKeyword = deptKeywords.some(
    (kw) =>
      bookGenre.includes(kw) ||
      bookTitle.includes(kw) ||
      bookTags.some((t) => t.includes(kw))
  );
  if (matchesMajorKeyword) {
    score += 30;
  }

  // C. Custom Interests / Tags overlap (+20 points)
  const matchingTags = bookTags.filter((t) =>
    userInterests.some((interest) => t.includes(interest) || interest.includes(t))
  );
  if (matchingTags.length > 0) {
    score += Math.min(20, matchingTags.length * 10);
  }

  // D. Rating bonus (up to 10 points for 4.0 - 5.0 rating)
  const ratingNum = parseFloat(book.rating) || 4.0;
  if (ratingNum >= 4.5) {
    score += 10;
  } else if (ratingNum >= 4.0) {
    score += 6;
  }

  // Cap score between 35 and 99%
  return Math.min(99, Math.max(35, Math.round(score)));
}

/**
 * 2. GET PERSONALIZED RECOMMENDATIONS FOR USER
 * Filters and ranks the catalog to present the highest scoring books for this student.
 * Excludes books the student has already read or is currently reading.
 */
export function getPersonalizedRecommendations(user, allBooks = [], limit = 12) {
  if (!Array.isArray(allBooks) || allBooks.length === 0) return [];
  if (!user) return allBooks.slice(0, limit);

  const readIds = new Set((user.readBooks || []).map(String));
  const currentIds = new Set(
    (user.continueReading || []).map((item) => String(item.bookId || item.id))
  );

  // Score each book
  const scoredBooks = allBooks
    .filter((b) => {
      const bId = String(b.id || b.isbn);
      return !readIds.has(bId) && !currentIds.has(bId);
    })
    .map((b) => ({
      ...b,
      matchScore: calculateBookMatchScore(user, b),
    }));

  // Sort by match score descending, then by rating
  scoredBooks.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
  });

  return scoredBooks.slice(0, limit);
}

/**
 * 3. GET MAJOR-SPECIFIC BOOKS
 * Curates a shelf tailored specifically to the student's field of study.
 */
export function getMajorSpecificBooks(user, allBooks = [], limit = 10) {
  if (!Array.isArray(allBooks) || allBooks.length === 0) return [];
  if (!user || !user.major) return allBooks.slice(0, limit);

  const deptKeywords = MAJOR_KEYWORDS[user.major] || [];
  if (deptKeywords.length === 0) {
    return allBooks.slice(0, limit);
  }

  const matches = allBooks.filter((book) => {
    const genre = (book.genre || "").toLowerCase();
    const title = (book.title || book.bookname || "").toLowerCase();
    const tags = (book.tags || []).map((t) => t.toLowerCase());

    return deptKeywords.some(
      (kw) => genre.includes(kw) || title.includes(kw) || tags.some((t) => t.includes(kw))
    );
  });

  return (matches.length >= 3 ? matches : allBooks).slice(0, limit);
}

/**
 * 4. GET RECOMMENDATION REASON STRING
 * Generates an intuitive explanation for the student and faculty:
 * e.g., "96% Match · Recommended based on your Computer Science & AI major and interest in Machine Learning"
 */
export function getRecommendationReason(user, book) {
  if (!user || !book) return "Popular in the University Library";

  const score = calculateBookMatchScore(user, book);
  const bookGenre = book.genre || "General";
  const userGenres = (user.preferredGenres || []).map((g) => g.toLowerCase());
  const userInterests = (user.interests || []).map((i) => i.toLowerCase());
  const bookTags = (book.tags || []).map((t) => t.toLowerCase());

  const matchingInterest = bookTags.find((t) =>
    userInterests.some((ui) => t.includes(ui) || ui.includes(t))
  );

  if (userGenres.includes(bookGenre.toLowerCase())) {
    return `${score}% Match · Directly matches your interest in ${bookGenre}`;
  }

  if (matchingInterest) {
    return `${score}% Match · Recommended for your focus in "${matchingInterest}"`;
  }

  if (user.major) {
    return `${score}% Match · Curated for ${user.major} students`;
  }

  return `${score}% Match · Top rated campus recommendation`;
}
