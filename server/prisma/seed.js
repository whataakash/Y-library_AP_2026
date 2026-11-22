const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TARGET = 700;
const DATA_FILE = path.join(__dirname, "data", "books.json");

const genres = [
  "fiction", "fantasy", "science_fiction", "mystery",
  "thriller", "romance", "horror", "historical_fiction",
  "literary_fiction", "young_adult", "classics", "poetry",
  "philosophy", "psychology", "self_help", "business",
  "economics", "history", "biography", "science",
  "physics", "mathematics", "computer_science",
  "programming", "artificial_intelligence", "technology",
  "travel", "politics", "sociology", "mythology",
  "religion", "environment", "health", "education"
];

const shelves = [
  "A-01", "A-02", "A-03", "B-01",
  "B-02", "B-03", "C-01", "C-02",
  "D-01", "D-02", "E-01", "E-02"
];

function getISBN(isbns = []) {
  const clean = isbns.map(isbn =>
    isbn.replace(/[^0-9X]/gi, "")
  );

  return clean.find(isbn => /^\d{13}$/.test(isbn)) ||
    clean.find(isbn => /^\d{9}[\dX]$/i.test(isbn)) ||
    null;
}

function getGenre(subject, subjects = []) {
  const text = `${subject} ${subjects.join(" ")}`
    .toLowerCase()
    .replaceAll("_", " ");

  const mappings = [
    [/artificial intelligence|machine learning|computer science|programming|software/, "Technology"],
    [/science fiction|dystopia|space/, "Science Fiction"],
    [/fantasy|magic|dragons/, "Fantasy"],
    [/mystery|detective|crime/, "Mystery"],
    [/thriller|suspense/, "Thriller"],
    [/romance|love stories/, "Romance"],
    [/horror|ghost/, "Horror"],
    [/historical fiction/, "Historical Fiction"],
    [/biography|autobiography|memoir/, "Biography"],
    [/philosophy|ethics/, "Philosophy"],
    [/psychology|cognition/, "Psychology"],
    [/business|management|entrepreneurship/, "Business"],
    [/economics|finance/, "Economics"],
    [/history/, "History"],
    [/physics|chemistry|biology|science/, "Science"],
    [/poetry|poems/, "Poetry"],
    [/travel/, "Travel"],
    [/young adult|juvenile/, "Young Adult"],
    [/classics|classic literature/, "Classics"]
  ];

  const match = mappings.find(([regex]) => regex.test(text));

  return match ? match[1] : "General Fiction";
}

function getTags(subject, subjects = []) {
  return [...new Set(
    [subject, ...subjects]
      .map(tag => tag.toLowerCase().replaceAll("_", " ").trim())
      .filter(tag => tag.length > 2)
  )].slice(0, 8);
}

async function fetchBooks(subject, page) {
  const url = new URL("https://openlibrary.org/search.json");

  url.searchParams.set("subject", subject);
  url.searchParams.set("page", page);
  url.searchParams.set("limit", 100);
  url.searchParams.set(
    "fields",
    "title,author_name,isbn,cover_i,first_publish_year,edition_count,ratings_average,subject"
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.docs || [];
}

function formatBook(book, subject, index) {
  const isbn = getISBN(book.isbn);

  if (!isbn || !book.title || !book.author_name?.length) {
    return null;
  }

  const total = 2 + (index % 19);
  const unavailable = index % 5 === 0 ? 1 : 0;

  return {
    bookname: book.title.trim(),

    book_image: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,

    isbn,

    total_count: total,

    available_count: Math.max(0, total - unavailable),

    edition: book.first_publish_year
      ? `${book.first_publish_year} publication; ${book.edition_count || 1} indexed editions`
      : `${book.edition_count || 1} indexed editions`,

    rating: typeof book.ratings_average === "number"
      ? Number(book.ratings_average.toFixed(2))
      : null,

    location: `Central Library / ${shelves[index % shelves.length]}`,

    author: book.author_name.slice(0, 3).join(", "),

    genre: getGenre(subject, book.subject),

    tags: getTags(subject, book.subject)
  };
}

/**
 * Live crawler routine to fetch 700 books directly from Open Library API
 */
async function fetchDatasetFromAPI() {
  const collection = new Map();

  for (const subject of genres) {
    if (collection.size >= TARGET) break;

    console.log(`Fetching Open Library: ${subject}`);

    for (let page = 1; page <= 3; page++) {
      if (collection.size >= TARGET) break;

      try {
        const books = await fetchBooks(subject, page);

        for (const book of books) {
          const record = formatBook(
            book,
            subject,
            collection.size
          );

          if (record && !collection.has(record.isbn)) {
            collection.set(record.isbn, record);
          }

          if (collection.size >= TARGET) break;
        }
      } catch (err) {
        console.warn(`Could not fetch ${subject} (page ${page}): ${err.message}`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Collected from API: ${collection.size}/${TARGET}`);
  }

  return [...collection.values()].slice(0, TARGET);
}

/**
 * Main Seeding Logic
 * 1. Checks if prisma/data/books.json exists (loads 700 books instantly)
 * 2. If --fetch-live flag is passed, fetches fresh books from Open Library
 * 3. Inserts all books into PostgreSQL via Prisma
 */
async function main() {
  console.log("================================================");
  console.log("📚 Y-LIBRARY DATABASE SEEDER (700 BOOKS)");
  console.log("================================================");

  let books = [];
  const shouldFetchLive = process.argv.includes("--fetch-live");

  if (shouldFetchLive) {
    console.log("🌐 --fetch-live flag detected: Crawling live Open Library API...");
    books = await fetchDatasetFromAPI();
    // Cache to JSON so it can be edited later
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2));
    console.log(`💾 Saved ${books.length} live books to ${DATA_FILE}`);
  } else if (fs.existsSync(DATA_FILE)) {
    console.log(`📂 Loading 700 books from editable JSON file:`);
    console.log(`   ${DATA_FILE}`);
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    books = JSON.parse(raw);
  } else {
    console.log("⚠️  JSON file not found. Crawling Open Library API...");
    books = await fetchDatasetFromAPI();
  }

  console.log(`📦 Ready to insert ${books.length} books into PostgreSQL...`);

  // Idempotent insertion: skips books with ISBNs already in the database
  const result = await prisma.book.createMany({
    data: books,
    skipDuplicates: true
  });

  console.log("================================================");
  console.log("✅ BOOK SEEDING COMPLETED SUCCESSFULLY!");
  console.log(`🎯 Target books count: ${books.length}`);
  console.log(`🆕 New records inserted: ${result.count}`);
  console.log("------------------------------------------------");
  console.log("💡 HOW TO EDIT OR ADD ACTUAL DATA LATER:");
  console.log("1. Open: server/prisma/data/books.json (or database/seed.sql)");
  console.log("2. Edit, add, or customize any book details or actual data.");
  console.log("3. Re-run: npx prisma db seed (or npm run seed)");
  console.log("4. To re-fetch from Open Library API: npm run seed -- --fetch-live");
  console.log("================================================");
}

main()
  .catch(error => {
    console.error("❌ Seeding error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
