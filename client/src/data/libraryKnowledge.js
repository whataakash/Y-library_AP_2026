// client/src/data/libraryKnowledge.js
// Client-side Library Knowledge Base and Offline Fallback Engine
// Empowers the AI Chatbot to answer project, architecture, rules, timings,
// and DBMS viva questions seamlessly in both connected and offline presentation modes.

export const LIBRARY_INFO = {
  name: "Y-Library (Campus Library Management System)",
  edition: "AP 2026 & DBMS Capstone Edition",
  description:
    "Y-Library is a campus library platform built for students and faculty. It supports multi-tag book discovery, physical shelf navigation, student account management, and ACID-compliant book borrowing transactions.",

  techStack: [
    { label: "Frontend", detail: "React 18 + Vite with custom Steam-inspired dark/light theme & pure CSS" },
    { label: "Backend", detail: "Node.js + Express.js modular MVC architecture (Port 5001)" },
    { label: "Database", detail: "PostgreSQL 14+ with native TEXT[] array tagging (Port 5432)" },
    { label: "ORM Layer", detail: "Prisma ORM for schema migrations, relational modeling, and transactions" },
    { label: "External APIs", detail: "Google Books & OpenLibrary APIs for cover art and fallback resilience" },
  ],

  timings: {
    weekdays: "Monday – Friday: 8:00 AM – 10:00 PM",
    weekends: "Saturday – Sunday: 10:00 AM – 6:00 PM",
    exams: "24/7 Silent Reading Halls open during Mid-Term & Final exams",
    desk: "Issue/Return desk closes 30 minutes before library closing",
  },

  wings: [
    {
      wing: "East Wing · Level 3 (Shelves A-01 to B-20)",
      focus: "Computer Science, Artificial Intelligence, Software Engineering, Discrete Math",
    },
    {
      wing: "West Wing · Level 2 (Shelves C-01 to D-15)",
      focus: "Classic Literature, Dark Academia, World History, Philosophy, Psychology",
    },
    {
      wing: "North Hall · Level 1 (Shelves N-01 to N-10)",
      focus: "Natural Sciences, Physics, Chemistry, Biology, Environmental Systems",
    },
    {
      wing: "Central Reserve · Ground Floor (Desk R-1)",
      focus: "Reserved Course Textbooks, High-demand Reference Material, Theses",
    },
  ],

  rules: [
    { title: "Loan Duration", value: "14 Calendar Days per borrowed book" },
    { title: "Checkout Limit", value: "Up to 4 concurrent books per student" },
    { title: "Renewals", value: "Up to 2 renewals allowed unless another student reserved the title" },
    { title: "Late Fees", value: "$0.50 per day past the 14-day due date" },
    { title: "Eligibility", value: "Active university students, researchers & faculty with an Enrollment ID" },
  ],

  databaseSchema: {
    booksTable: {
      table: "books",
      fields: "id (PK), bookname, book_image, isbn (UNIQUE), total_count, available_count, edition, rating, location, author, genre, tags (TEXT[])",
      highlight: "tags uses native PostgreSQL TEXT[] queried with array containment (@>) for optimal multi-tag index filtering.",
    },
    borrowRecordsTable: {
      table: "borrow_records",
      fields: "id (PK), book_id (FK), user_name, user_email, borrow_date, due_date, return_date, status ('BORROWED' | 'RETURNED')",
      highlight: "Checkout is wrapped in an atomic prisma.$transaction to prevent overselling inventory.",
    },
    usersTable: {
      table: "users",
      fields: "id (PK), email (UNIQUE), name, major, reading_goal (JSON)",
      highlight: "Stores personalization preferences, reading streaks, and annual reading targets.",
    },
  },

  facultyVivaHighlights: [
    {
      q: "Why use PostgreSQL arrays (TEXT[]) instead of a comma-separated string for tags?",
      a: "Comma-separated strings force slow, non-sargable LIKE '%tag%' full-table scans. PostgreSQL native arrays support GIN (Generalized Inverted Index) indexing and the '@>' operator (`tags: { has: query }` in Prisma), delivering logarithmic search speeds across tens of thousands of records.",
    },
    {
      q: "How does the system ensure ACID compliance during a book checkout?",
      a: "In `borrow.controller.js`, creating the borrow log and decrementing `available_count` are executed inside a single `prisma.$transaction([ ... ])`. If an error occurs (such as concurrent depletion of stock), both operations roll back completely.",
    },
    {
      q: "How is frontend resilience handled if the backend is down?",
      a: "In `client/src/services/api.js`, fetch errors catch network timeouts and fall back automatically to an embedded catalog supplemented by the live Google Books API, ensuring faculty demos never show blank screens.",
    },
  ],

  suggestedCategories: [
    {
      name: "Campus Hours & Rules",
      queries: [
        "What are the library hours?",
        "What are the borrowing rules?",
        "How many books can I borrow?",
        "What are the late fees?",
      ],
    },
    {
      name: "Architecture & Tech Stack",
      queries: [
        "What is the tech stack of this project?",
        "Explain the project architecture",
        "Which database and ORM are used?",
        "What port does the backend run on?",
      ],
    },
    {
      name: "DBMS & Faculty Viva",
      queries: [
        "Explain the PostgreSQL database schema",
        "How does multi-tag searching work?",
        "Explain ACID transactions in borrowing",
        "How is demo resilience handled if DB is offline?",
      ],
    },
    {
      name: "Shelf Locations & Books",
      queries: [
        "Where are Computer Science books located?",
        "Where can I find Philosophy and History?",
        "Where are course textbooks kept?",
        "How do I find a book in the catalog?",
      ],
    },
  ],
};

/**
 * Intelligent Client Fallback generator
 */
export function generateClientAnswer(query, studentName, enrollmentId) {
  const q = query.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b/.test(q)) {
    return {
      text: `Hello ${studentName}! 👋 Welcome to Y-Library Assistant (Student ID: **${enrollmentId}**).\n\nI can answer questions regarding project architecture, PostgreSQL database schema, borrowing regulations, campus shelf locations, and library hours. What would you like to explore?`,
      suggestions: [
        "What are the library hours?",
        "What is the tech stack?",
        "Explain the database schema",
        "What are the borrowing rules?",
      ],
    };
  }

  // Operating Hours
  if (q.includes("hour") || q.includes("timing") || q.includes("open") || q.includes("close") || q.includes("when")) {
    return {
      text: `⏰ **Y-Library Operating Hours:**\n\n• **Weekdays:** ${LIBRARY_INFO.timings.weekdays}\n• **Weekends:** ${LIBRARY_INFO.timings.weekends}\n• **Exam Periods:** ${LIBRARY_INFO.timings.exams}\n• **Circulation Desk:** ${LIBRARY_INFO.timings.desk}`,
      suggestions: ["What are the borrowing rules?", "Where are physical books located?", "What is the tech stack?"],
    };
  }

  // Borrowing Rules & Limits
  if (q.includes("rule") || q.includes("borrow") || q.includes("loan") || q.includes("fine") || q.includes("due") || q.includes("limit")) {
    const rulesList = LIBRARY_INFO.rules.map((r) => `• **${r.title}:** ${r.value}`).join("\n");
    return {
      text: `📋 **Library Borrowing Policy & Regulations:**\n\n${rulesList}\n\n*To borrow, simply browse any title on the Explore tab and click "Borrow This Book".*`,
      suggestions: ["How do I return a book?", "Explain ACID transactions in borrowing", "What are the library hours?"],
    };
  }

  // Physical Locations & Wings
  if (q.includes("location") || q.includes("shelf") || q.includes("shelves") || q.includes("where") || q.includes("floor") || /\b(wing|wings)\b/.test(q)) {
    const wingsList = LIBRARY_INFO.wings.map((w) => `📍 **${w.wing}**\n  *Covers:* ${w.focus}`).join("\n\n");
    return {
      text: `🗺️ **Campus Library Physical Locations:**\n\n${wingsList}\n\n*Every book in our Explore catalog lists its exact shelf ID (e.g. East Library · Level 3, Shelf B-14).*`,
      suggestions: ["Where are Computer Science books?", "What are the library hours?", "What are the borrowing rules?"],
    };
  }

  // Database Schema
  if (q.includes("schema") || q.includes("database") || q.includes("table") || q.includes("column") || q.includes("postgres") || q.includes("prisma")) {
    const s = LIBRARY_INFO.databaseSchema;
    return {
      text: `💾 **PostgreSQL Database Schema (via Prisma ORM):**\n\n` +
        `1. **\`${s.booksTable.table}\`:** ${s.booksTable.fields}\n  *Note:* ${s.booksTable.highlight}\n\n` +
        `2. **\`${s.borrowRecordsTable.table}\`:** ${s.borrowRecordsTable.fields}\n  *Note:* ${s.borrowRecordsTable.highlight}\n\n` +
        `3. **\`${s.usersTable.table}\`:** ${s.usersTable.fields}\n  *Note:* ${s.usersTable.highlight}`,
      suggestions: ["How does multi-tag searching work?", "Explain ACID transactions in borrowing", "What is the tech stack?"],
    };
  }

  // Tech Stack & Architecture
  if (q.includes("tech stack") || q.includes("architecture") || q.includes("technologies") || q.includes("built") || q.includes("framework")) {
    const tech = LIBRARY_INFO.techStack.map((t) => `• **${t.label}:** ${t.detail}`).join("\n");
    return {
      text: `🏗️ **Y-Library Technical Architecture:**\n\n${tech}\n\nDesigned with clean separation of concerns, modular MVC controllers, and full REST API integration.`,
      suggestions: ["Explain the database schema", "How does multi-tag searching work?", "What are the borrowing rules?"],
    };
  }

  // Faculty Viva Questions
  if (q.includes("viva") || q.includes("faculty") || q.includes("multi-tag") || q.includes("acid") || q.includes("transaction") || q.includes("fallback")) {
    const viva = LIBRARY_INFO.facultyVivaHighlights.map((v, i) => `**Q${i + 1}: ${v.q}**\n${v.a}`).join("\n\n");
    return {
      text: `🎓 **Key Points for Faculty Viva & Presentation:**\n\n${viva}`,
      suggestions: ["Explain the database schema", "What is the tech stack?", "What are the borrowing rules?"],
    };
  }

  // Default Guidance
  return {
    text: `Hello ${studentName}! I am here to assist you with everything related to **Y-Library**.\n\nYou can ask me about:\n• ⏰ **Operating hours & exam schedules**\n• 📋 **14-day borrowing regulations and limits**\n• 🗺️ **Finding shelf locations across library wings**\n• 🏗️ **React, Express, and PostgreSQL tech stack**\n• 💾 **Database schema and Prisma migrations**\n• 🎓 **Faculty presentation & viva answers**`,
    suggestions: [
      "What are the library hours?",
      "What are the borrowing rules?",
      "Explain the database schema",
      "What is the tech stack?",
    ],
  };
}
