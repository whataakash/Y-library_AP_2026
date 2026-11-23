// server/src/data/projectKnowledge.js
// Comprehensive Knowledge Base for Y-Library Project
// Provides authoritative answers regarding system architecture, database schema,
// borrowing rules, physical book locations, operating timings, and faculty viva explanations.

const PROJECT_KNOWLEDGE = {
  projectOverview: {
    name: "Y-Library (Campus Library Management System)",
    academicContext: "Designed for Advanced Programming (AP 2026) & Database Management Systems (DBMS)",
    tagline: "Modern university library catalog & student borrowing portal",
    description:
      "Y-Library is a full-stack campus library web application designed to manage book discovery, multi-tag filtering, shelf locating, student account authentication, and ACID-compliant book borrowing transactions with automatic inventory tracking.",
  },

  techStack: {
    frontend: "React 18 (Vite), Pure CSS / Custom Steam-inspired Dark & Light Design System, Runeicons",
    backend: "Node.js with Express.js (Modular MVC architecture: routes, controllers, middleware, config)",
    database: "PostgreSQL 14+ hosted locally or remotely",
    orm: "Prisma ORM for typesafe schema definitions, migrations, and query generation",
    externalAPIs: "Google Books API & OpenLibrary API for cover artwork and fallback catalog metadata",
    ports: {
      frontend: 5173,
      backend: 5001,
      database: 5432,
    },
  },

  operatingHours: {
    weekdays: "Monday – Friday: 08:00 AM – 10:00 PM",
    weekends: "Saturday – Sunday: 10:00 AM – 06:00 PM",
    examWeeks: "24/7 Silent Reading Halls open during Mid-Term and Final Examination weeks",
    circulationDesk: "Closes 30 minutes before building closure",
  },

  libraryLocations: [
    {
      wing: "East Wing (Level 3)",
      shelves: "Shelves A-01 through B-20",
      subjects: "Computer Science, AI, Mathematics, Engineering, Software Design",
    },
    {
      wing: "West Wing (Level 2)",
      shelves: "Shelves C-01 through D-15",
      subjects: "Literature, Philosophy, Dark Academia, World History, Psychology",
    },
    {
      wing: "North Hall (Level 1)",
      shelves: "Shelves N-01 through N-10",
      subjects: "General Sciences, Physics, Chemistry, Biology, Environmental Studies",
    },
    {
      wing: "Central Reserve Desk (Ground Floor)",
      shelves: "Counter R-1",
      subjects: "Course textbooks, High-demand reference materials, Periodicals",
    },
  ],

  borrowingRules: {
    loanDurationDays: 14,
    maxBooksAllowed: 4,
    renewalLimit: "Books can be renewed up to 2 times if no other student has placed a hold",
    lateFeePolicy: "$0.50 per day per book past the 14-day due date",
    lostBookPolicy: "Replacement cost of the book plus a standard $15 processing fee",
    eligibility: "Active university students, faculty, and enrolled researchers with a valid Enrollment ID",
  },

  databaseSchema: {
    booksTable: {
      name: "books",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", desc: "Auto-incrementing unique identifier" },
        { name: "bookname", type: "VARCHAR(255) NOT NULL", desc: "Title of the book" },
        { name: "book_image", type: "TEXT NOT NULL", desc: "OpenLibrary/Google Books cover URL" },
        { name: "isbn", type: "VARCHAR(32) UNIQUE NOT NULL", desc: "Unique ISBN-10 or ISBN-13" },
        { name: "total_count", type: "INTEGER DEFAULT 1", desc: "Total physical copies owned" },
        { name: "available_count", type: "INTEGER DEFAULT 1", desc: "Copies currently available on shelf" },
        { name: "edition", type: "VARCHAR(50) DEFAULT '1st Edition'", desc: "Publication edition" },
        { name: "rating", type: "FLOAT DEFAULT 4.5", desc: "Student review rating out of 5.0" },
        { name: "location", type: "VARCHAR(255) NOT NULL", desc: "Physical shelf/floor location" },
        { name: "author", type: "VARCHAR(255) NOT NULL", desc: "Author name(s)" },
        { name: "genre", type: "VARCHAR(100) NOT NULL", desc: "Primary genre" },
        { name: "tags", type: "TEXT[]", desc: "PostgreSQL native string array for multi-tag querying" },
      ],
    },
    borrowRecordsTable: {
      name: "borrow_records",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", desc: "Unique borrow transaction ID" },
        { name: "book_id", type: "INTEGER REFERENCES books(id)", desc: "Foreign key to books table" },
        { name: "user_name", type: "VARCHAR(255) NOT NULL", desc: "Borrower student name" },
        { name: "user_email", type: "VARCHAR(255) NOT NULL", desc: "University email address" },
        { name: "borrow_date", type: "TIMESTAMP DEFAULT NOW()", desc: "Checkout timestamp" },
        { name: "due_date", type: "TIMESTAMP NOT NULL", desc: "14-day return deadline" },
        { name: "return_date", type: "TIMESTAMP NULL", desc: "Timestamp when returned (NULL if active)" },
        { name: "status", type: "VARCHAR(50) DEFAULT 'BORROWED'", desc: "Status: 'BORROWED' or 'RETURNED'" },
      ],
    },
    usersTable: {
      name: "users",
      columns: [
        { name: "id", type: "SERIAL PRIMARY KEY", desc: "Student profile ID" },
        { name: "email", type: "VARCHAR(255) UNIQUE NOT NULL", desc: "Institutional email" },
        { name: "name", type: "VARCHAR(255) NOT NULL", desc: "Full student name" },
        { name: "major", type: "VARCHAR(255)", desc: "Academic department/major" },
        { name: "reading_goal", type: "JSON", desc: "Annual target, books completed, streak days" },
      ],
    },
  },

  facultyVivaHighlights: [
    {
      question: "How does multi-tag searching work in PostgreSQL?",
      answer:
        "Unlike comma-separated strings that require slow LIKE '%pattern%' scans, tags are stored as native PostgreSQL arrays (TEXT[]). In Prisma, we query with `tags: { has: query }`, which compiles to PostgreSQL's GIN-indexable array containment operator `@>`. This guarantees O(log N) lookup efficiency.",
    },
    {
      question: "How does the system ensure data integrity during borrowing?",
      answer:
        "Borrowing uses Prisma ACID transactions (`prisma.$transaction`). It atomically writes a `borrow_records` row and decrements `available_count` on the `books` table. If the book has zero available copies or the database loses connection mid-flight, the entire transaction rolls back.",
    },
    {
      question: "What happens if PostgreSQL is down during a presentation?",
      answer:
        "The frontend client is built with resilient fallback handlers in `api.js`. If `http://localhost:5001` is unreachable, it automatically serves cached seed data augmented by live Google Books API results so the presentation never fails.",
    },
  ],

  frequentlyAskedQuestions: [
    {
      q: "How do I borrow a book?",
      a: "Browse the catalog on the Explore page, click on any book to view its details and shelf location, then click the 'Borrow This Book' button. Enter your name and student email to complete checkout for 14 days.",
    },
    {
      q: "Where can I find my active loans and reading streaks?",
      a: "Navigate to the 'Favorites & Loans' dashboard from the sidebar or dock. It displays your current loans, due dates, reading goals, and streak count.",
    },
    {
      q: "How do I return a book?",
      a: "Visit the 'Favorites & Loans' dashboard, find the borrowed book under 'Active Loans', and click 'Return Book'. The system marks the transaction returned and replenishes the shelf count.",
    },
    {
      q: "Can I request a book that isn't currently in the library?",
      a: "Yes! Use the 'Requests' tab from the sidebar to submit a book acquisition or inter-library loan request.",
    },
  ],
};

module.exports = PROJECT_KNOWLEDGE;
