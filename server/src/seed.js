// Database Seeder Script for Y-Library
// Uses Open Library search API with topic rules, genre inference, and tag extraction
// Matching the exact dataset rules requested for faculty presentation

const prisma = require("./config/prisma");

const PAGE_SIZE = 20;
const TARGET_COUNT = 50;

const SUBJECTS = [
  "computer_science",
  "science_fiction",
  "fantasy",
  "mystery",
  "thriller",
  "romance",
  "horror",
  "historical_fiction",
  "biography",
  "philosophy",
  "psychology",
  "business",
  "economics",
  "history",
  "science",
  "poetry",
  "classic_literature",
];

const SHELVES = [
  "Floor 1 - Section A (General & Classics)",
  "Floor 1 - Section B (Fiction & Mystery)",
  "Floor 2 - Section C (Science & Tech)",
  "Floor 2 - Section D (Philosophy & Psychology)",
  "Floor 3 - Section E (Economics & Business)",
  "Floor 3 - Section F (History & Biography)",
  "East Annex - Shelf 101",
  "West Wing - Rack 4B",
];

/**
 * Clean and extract a valid 10 or 13 character ISBN from OpenLibrary doc
 */
function cleanIsbn(isbnList) {
  if (!isbnList) return null;
  const list = Array.isArray(isbnList) ? isbnList : [isbnList];
  for (const item of list) {
    const cleaned = String(item).replace(/[^0-9X]/gi, "").trim();
    if (cleaned.length === 10 || cleaned.length === 13) {
      return cleaned;
    }
  }
  return list[0] ? String(list[0]).trim() : null;
}

/**
 * 1. Infer book genre using regex rules against subjects and text
 */
function inferGenre(subject, subjects = []) {
  const text = [subject, ...(subjects || [])].join(" ").toLowerCase();

  const rules = [
    [/artificial intelligence|machine learning|computer science|programming|software|technology/, "Technology & Computer Science"],
    [/science fiction|science-fiction|dystopia|space/, "Science Fiction"],
    [/fantasy|magic|dragons|myth/, "Fantasy"],
    [/mystery|detective|crime|suspense/, "Mystery & Crime"],
    [/thriller|espionage|psychological suspense/, "Thriller"],
    [/romance|love stories/, "Romance"],
    [/horror|ghost|vampire/, "Horror"],
    [/historical fiction|historical novel/, "Historical Fiction"],
    [/biography|autobiography|memoir/, "Biography & Memoir"],
    [/philosophy|ethics|metaphysics/, "Philosophy"],
    [/psychology|mental health|cognition/, "Psychology"],
    [/business|management|entrepreneurship/, "Business"],
    [/economics|finance/, "Economics & Finance"],
    [/history|historical/, "History"],
    [/physics|chemistry|biology|astronomy|science/, "Science"],
    [/poetry|poems/, "Poetry"],
    [/travel|travel writing/, "Travel"],
    [/young adult|juvenile|teenage/, "Young Adult"],
    [/classic literature|classics/, "Classics"],
  ];

  return rules.find(([pattern]) => pattern.test(text))?.[1] ?? "General Fiction";
}

/**
 * 2. Create up to 8 sanitized search tags from subjects
 */
function makeTags(subject, subjects = []) {
  const words = [subject.replaceAll("_", " "), ...(subjects || [])]
    .flatMap((s) => (typeof s === "string" ? s.toLowerCase().split(/[,;:/]/) : []))
    .map((s) => s.trim().replace(/\s+/g, "-"))
    .filter((s) => s.length > 2 && s.length < 32);
  return [...new Set(words)].slice(0, 8);
}

/**
 * 3. Fetch search documents for a subject from Open Library API
 */
async function fetchSubject(subject, page) {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("subject", subject);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("page", String(page));
  url.searchParams.set(
    "fields",
    "title,author_name,isbn,cover_i,first_publish_year,edition_count,ratings_average,subject"
  );

  const response = await fetch(url, {
    headers: { "User-Agent": "LibraryCatalogSeed/1.0 (development dataset)" },
  });

  if (!response.ok) throw new Error(`Open Library returned ${response.status}`);
  const json = await response.json();
  return json.docs || [];
}

/**
 * 4. Transform OpenLibrary document to Prisma database record
 */
function toPrismaRecord(doc, subject, index) {
  const isbn = cleanIsbn(doc.isbn);
  if (!isbn || !doc.title || !doc.author_name?.length) return null;

  const total = 2 + (index % 19);
  const unavailable = index % 5 === 0 ? 1 : index % 7 === 0 ? 2 : 0;
  const available = Math.max(0, total - unavailable);
  const cover = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  return {
    bookname: doc.title.trim(),
    book_image: cover,
    isbn,
    total_count: total,
    available_count: available,
    edition: doc.first_publish_year
      ? `${doc.first_publish_year} first published; ${doc.edition_count ?? 1} edition(s) indexed`
      : `${doc.edition_count ?? 1} edition(s) indexed`,
    rating:
      typeof doc.ratings_average === "number"
        ? Math.round(doc.ratings_average * 100) / 100
        : 4.5,
    location: `Central Library / ${SHELVES[index % SHELVES.length]}`,
    author: doc.author_name.slice(0, 3).join(", "),
    genre: inferGenre(subject, doc.subject),
    tags: makeTags(subject, doc.subject),
  };
}

/**
 * Offline / Fallback dataset prepared with the exact same rules
 */
const OFFLINE_FALLBACK_RECORDS = [
  {
    bookname: "Clean Code: A Handbook of Agile Software Craftsmanship",
    book_image: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    isbn: "9780132350884",
    total_count: 5,
    available_count: 4,
    edition: "2008 first published; 6 edition(s) indexed",
    rating: 4.7,
    location: "Central Library / Floor 2 - Section C (Science & Tech)",
    author: "Robert C. Martin",
    genre: "Technology & Computer Science",
    tags: ["computer-science", "programming", "software-engineering", "agile", "technology"],
  },
  {
    bookname: "Dune",
    book_image: "https://covers.openlibrary.org/b/id/12838383-L.jpg",
    isbn: "9780441172719",
    total_count: 8,
    available_count: 6,
    edition: "1965 first published; 42 edition(s) indexed",
    rating: 4.8,
    location: "Central Library / Floor 1 - Section B (Fiction & Mystery)",
    author: "Frank Herbert",
    genre: "Science Fiction",
    tags: ["science-fiction", "space", "desert-planet", "classic", "dystopia"],
  },
  {
    bookname: "The Hobbit",
    book_image: "https://covers.openlibrary.org/b/id/12083547-L.jpg",
    isbn: "9780547928227",
    total_count: 6,
    available_count: 5,
    edition: "1937 first published; 75 edition(s) indexed",
    rating: 4.9,
    location: "Central Library / Floor 1 - Section A (General & Classics)",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    tags: ["fantasy", "magic", "dragons", "myth", "middle-earth"],
  },
  {
    bookname: "Thinking, Fast and Slow",
    book_image: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
    isbn: "9780374533557",
    total_count: 4,
    available_count: 3,
    edition: "2011 first published; 18 edition(s) indexed",
    rating: 4.6,
    location: "Central Library / Floor 2 - Section D (Philosophy & Psychology)",
    author: "Daniel Kahneman",
    genre: "Psychology",
    tags: ["psychology", "cognition", "decision-making", "behavioral-economics"],
  },
  {
    bookname: "The Republic",
    book_image: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
    isbn: "9780140455113",
    total_count: 4,
    available_count: 2,
    edition: "375 BC first published; 120 edition(s) indexed",
    rating: 4.5,
    location: "Central Library / Floor 2 - Section D (Philosophy & Psychology)",
    author: "Plato",
    genre: "Philosophy",
    tags: ["philosophy", "ethics", "justice", "political-theory", "classics"],
  },
  {
    bookname: "The Psychology of Money",
    book_image: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
    isbn: "9780857197689",
    total_count: 7,
    available_count: 5,
    edition: "2020 first published; 8 edition(s) indexed",
    rating: 4.75,
    location: "Central Library / Floor 3 - Section E (Economics & Business)",
    author: "Morgan Housel",
    genre: "Economics & Finance",
    tags: ["economics", "finance", "money", "investing", "psychology"],
  },
];

/**
 * Main Seeding Routine
 */
async function main() {
  console.log("🌱 Fetching dataset from Open Library API...");
  const records = new Map();

  try {
    for (const subject of SUBJECTS) {
      for (let page = 1; page <= 3 && records.size < TARGET_COUNT; page++) {
        try {
          const docs = await fetchSubject(subject, page);
          for (const doc of docs) {
            const record = toPrismaRecord(doc, subject, records.size);
            if (record && !records.has(record.isbn)) {
              records.set(record.isbn, record);
            }
            if (records.size >= TARGET_COUNT) break;
          }
        } catch (fetchErr) {
          console.warn(`Note: Could not fetch subject "${subject}" (page ${page}):`, fetchErr.message);
          break;
        }
        // Be polite to public Open Library API
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      if (records.size >= TARGET_COUNT) break;
    }
  } catch (err) {
    console.warn("Open Library network fetch stopped:", err.message);
  }

  // If API had network issues or returned few records, populate with offline fallback
  if (records.size < 5) {
    console.log("Using rich curated Open Library fallback dataset...");
    for (const rec of OFFLINE_FALLBACK_RECORDS) {
      if (!records.has(rec.isbn)) {
        records.set(rec.isbn, rec);
      }
    }
  }

  const books = [...records.values()].slice(0, TARGET_COUNT);
  console.log(`📦 Prepared ${books.length} ISBN-backed book records.`);

  // Idempotent seed: skip duplicates
  const result = await prisma.book.createMany({
    data: books,
    skipDuplicates: true,
  });

  console.log(`✅ Seed complete! Inserted ${result.count} new records into PostgreSQL.`);
}

main()
  .catch((error) => {
    console.error("❌ Seeding Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
