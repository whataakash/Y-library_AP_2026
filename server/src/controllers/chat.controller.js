// server/src/controllers/chat.controller.js
// Intelligent AI Chat Assistant Controller for Y-Library
// Answers questions about system architecture, database schema, library rules,
// operating hours, physical shelf locations, and real-time book queries.

const PROJECT_KNOWLEDGE = require("../data/projectKnowledge");
let prisma = null;
try {
  prisma = require("../config/prisma");
} catch (err) {
  console.warn("Prisma client not initialized in chat controller, continuing with fallback.");
}

/**
 * Normalizes input text for keyword pattern matching
 */
function normalizeQuery(text = "") {
  return text.toLowerCase().trim();
}

/**
 * Checks if user message is asking for book availability, search, or location
 */
async function searchCatalog(query) {
  if (!prisma) return null;
  try {
    const q = query.toLowerCase();
    const books = await prisma.book.findMany({
      where: {
        OR: [
          { bookname: { contains: q, mode: "insensitive" } },
          { author: { contains: q, mode: "insensitive" } },
          { genre: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      },
      take: 3,
    });
    return books;
  } catch (err) {
    console.warn("Catalog lookup warning in chat controller:", err.message);
    return null;
  }
}

/**
 * Core response generator based on project knowledge and dynamic database state
 */
async function generateAssistantReply(message, studentName, enrollmentId) {
  const q = normalizeQuery(message);

  // 1. Greetings & Personal Identity
  if (q.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b/)) {
    return {
      text: `Hello ${studentName}! 👋 Welcome to the Y-Library AI Assistant (Student ID: **${enrollmentId}**).\n\nI can help you explore books, check borrowing rules, find physical shelf locations, understand the project's tech stack, or explain the PostgreSQL database schema for your viva presentation. What would you like to know?`,
      suggestions: [
        "What are the library hours?",
        "How do I borrow a book?",
        "Explain the database schema",
        "Where are Computer Science books located?",
      ],
    };
  }

  // 2. Who created this / Project Overview & Purpose
  if (
    q.includes("about") ||
    q.includes("project") ||
    q.includes("what is y-library") ||
    q.includes("who made") ||
    q.includes("purpose")
  ) {
    return {
      text: `📚 **${PROJECT_KNOWLEDGE.projectOverview.name}**\n\n${PROJECT_KNOWLEDGE.projectOverview.description}\n\n• **Academic Context:** ${PROJECT_KNOWLEDGE.projectOverview.academicContext}\n• **Key Features:** Full book catalog, multi-tag search, shelf location navigation, student borrowing records, reading goals, and community book reviews.`,
      suggestions: [
        "What is the tech stack?",
        "Explain the database schema",
        "How does borrowing work?",
      ],
    };
  }

  // 3. Tech Stack & Architecture
  if (
    q.includes("tech stack") ||
    q.includes("architecture") ||
    q.includes("technologies") ||
    q.includes("how is it built") ||
    q.includes("framework")
  ) {
    const { frontend, backend, database, orm, externalAPIs, ports } = PROJECT_KNOWLEDGE.techStack;
    return {
      text: `🏗️ **Y-Library Technical Architecture:**\n\n` +
        `• **Frontend:** ${frontend} (Port ${ports.frontend})\n` +
        `• **Backend:** ${backend} (Port ${ports.backend})\n` +
        `• **Database:** ${database} (Port ${ports.database})\n` +
        `• **ORM Layer:** ${orm}\n` +
        `• **External APIs:** ${externalAPIs}\n\n` +
        `The application employs a decoupled client-server architecture with RESTful JSON endpoints and modular MVC separation.`,
      suggestions: [
        "Explain the database schema",
        "How does multi-tag searching work?",
        "How are ACID transactions used?",
      ],
    };
  }

  // 4. Operating Hours & Schedule
  if (
    q.includes("hour") ||
    q.includes("timing") ||
    q.includes("time") ||
    q.includes("open") ||
    q.includes("close") ||
    q.includes("when")
  ) {
    const { weekdays, weekends, examWeeks, circulationDesk } = PROJECT_KNOWLEDGE.operatingHours;
    return {
      text: `⏰ **Y-Library Operating Hours:**\n\n` +
        `• **Weekdays:** ${weekdays}\n` +
        `• **Weekends:** ${weekends}\n` +
        `• **Exam Weeks:** ${examWeeks}\n` +
        `• **Circulation Desk:** ${circulationDesk}\n\n` +
        `*Note: The online portal and AI assistant remain accessible 24/7!*`,
      suggestions: [
        "Where are physical books located?",
        "What are the borrowing rules?",
        "How many books can I borrow?",
      ],
    };
  }

  // 5. Physical Shelves and Wings
  if (
    q.includes("location") ||
    q.includes("shelf") ||
    q.includes("where") ||
    q.includes("wing") ||
    q.includes("floor")
  ) {
    const locationsText = PROJECT_KNOWLEDGE.libraryLocations
      .map(
        (loc) =>
          `📍 **${loc.wing}** (${loc.shelves})\n  *Subjects:* ${loc.subjects}`
      )
      .join("\n\n");
    return {
      text: `🗺️ **Campus Library Physical Locations:**\n\n${locationsText}\n\n*Tip: Every book card in our Explore catalog displays its exact physical shelf code (e.g. East Library · Level 3, Shelf B-14).*`,
      suggestions: [
        "Search Computer Science books",
        "What are the borrowing rules?",
        "Check library hours",
      ],
    };
  }

  // 6. Borrowing Rules, Loan Period & Fines
  if (
    q.includes("rule") ||
    q.includes("borrow") ||
    q.includes("loan") ||
    q.includes("fine") ||
    q.includes("return") ||
    q.includes("due") ||
    q.includes("limit")
  ) {
    const { loanDurationDays, maxBooksAllowed, renewalLimit, lateFeePolicy, eligibility } =
      PROJECT_KNOWLEDGE.borrowingRules;
    return {
      text: `📋 **Borrowing Rules & Loan Policy:**\n\n` +
        `• **Standard Loan Period:** ${loanDurationDays} days from checkout date\n` +
        `• **Max Books Allowed:** ${maxBooksAllowed} concurrent loans per student\n` +
        `• **Renewals:** ${renewalLimit}\n` +
        `• **Overdue Fines:** ${lateFeePolicy}\n` +
        `• **Eligibility:** ${eligibility}\n\n` +
        `Borrowing is fully automated: simply click **"Borrow This Book"** on any available title in the catalog!`,
      suggestions: [
        "How do I return a book?",
        "Explain ACID transactions in borrowing",
        "Where can I see my active loans?",
      ],
    };
  }

  // 7. Database Schema & Tables
  if (
    q.includes("schema") ||
    q.includes("database") ||
    q.includes("table") ||
    q.includes("column") ||
    q.includes("postgres") ||
    q.includes("prisma")
  ) {
    const { booksTable, borrowRecordsTable, usersTable } = PROJECT_KNOWLEDGE.databaseSchema;
    return {
      text: `💾 **PostgreSQL Database Schema (via Prisma ORM):**\n\n` +
        `1. **\`${booksTable.name}\` Table:** Stores book inventory with columns \`id\`, \`bookname\`, \`author\`, \`isbn\`, \`available_count\`, \`total_count\`, \`location\`, \`genre\`, and \`tags\` (TEXT[]).\n\n` +
        `2. **\`${borrowRecordsTable.name}\` Table:** Tracks checkout transactions with foreign key \`book_id\`, \`user_name\`, \`user_email\`, \`borrow_date\`, \`due_date\`, \`return_date\`, and \`status\` ('BORROWED' / 'RETURNED').\n\n` +
        `3. **\`${usersTable.name}\` Table:** Manages student accounts, majors, and reading streak goals.`,
      suggestions: [
        "How does multi-tag searching work?",
        "Explain ACID transactions in borrowing",
        "How is fallback handled if DB is offline?",
      ],
    };
  }

  // 8. Faculty Viva & Technical Questions
  if (
    q.includes("viva") ||
    q.includes("faculty") ||
    q.includes("multi-tag") ||
    q.includes("acid") ||
    q.includes("transaction") ||
    q.includes("fallback")
  ) {
    const highlights = PROJECT_KNOWLEDGE.facultyVivaHighlights
      .map((item, idx) => `**Q${idx + 1}: ${item.question}**\n${item.answer}`)
      .join("\n\n");
    return {
      text: `🎓 **Key Technical Insights for Faculty Presentation & Viva:**\n\n${highlights}`,
      suggestions: [
        "Explain the database schema",
        "What is the tech stack?",
        "What are the borrowing rules?",
      ],
    };
  }

  // 9. Specific Book or Genre Search in Live Catalog
  const matchedBooks = await searchCatalog(message);
  if (matchedBooks && matchedBooks.length > 0) {
    const bookList = matchedBooks
      .map(
        (b) =>
          `📖 **${b.bookname}** by ${b.author}\n  • **Available Copies:** ${b.available_count} / ${b.total_count}\n  • **Shelf Location:** ${b.location}\n  • **Genre:** ${b.genre} (ISBN: \`${b.isbn}\`)`
      )
      .join("\n\n");

    return {
      text: `🔎 **Found ${matchedBooks.length} matching title(s) in the campus catalog:**\n\n${bookList}\n\nYou can view full details or borrow them directly from the **Explore** tab.`,
      suggestions: [
        "What are the borrowing rules?",
        "Where are Computer Science books located?",
        "What are the library hours?",
      ],
    };
  }

  // 10. Default Helpful Fallback
  return {
    text: `Thanks for asking, ${studentName}! I am your Y-Library intelligent campus assistant.\n\nI can answer questions regarding:\n• ⏰ **Library Timings & Access Rules**\n• 🗺️ **Physical Shelf Locations by Subject**\n• 📋 **Borrowing Duration, Renewals & Policies**\n• 🏗️ **Full-Stack Architecture & Tech Stack**\n• 💾 **PostgreSQL Schema & Prisma ORM Design**\n• 🎓 **Faculty Viva & Presentation Highlights**\n\nFeel free to choose a prompt below or type any library-related question!`,
    suggestions: [
      "What are the library hours?",
      "Explain the database schema",
      "What are the borrowing rules?",
      "Where are Computer Science books?",
    ],
  };
}

/**
 * Endpoint: POST /api/chat/message
 * Accepts student question, verifies student name & enrollment ID, returns answer
 */
async function handleChatMessage(req, res, next) {
  try {
    const { message, studentName, enrollmentId } = req.body;

    if (!studentName || !enrollmentId) {
      return res.status(400).json({
        success: false,
        requiresEnrollment: true,
        message: "Please provide both studentName and enrollmentId before initiating chat.",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "A message string is required.",
      });
    }

    const reply = await generateAssistantReply(message, studentName, enrollmentId);

    return res.status(200).json({
      success: true,
      data: {
        reply: reply.text,
        suggestions: reply.suggestions || [],
        timestamp: new Date().toISOString(),
        student: {
          name: studentName,
          enrollmentId: enrollmentId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Endpoint: GET /api/chat/faq
 * Returns standard project FAQs and metadata
 */
function getChatFaq(req, res) {
  res.status(200).json({
    success: true,
    data: {
      overview: PROJECT_KNOWLEDGE.projectOverview,
      faqs: PROJECT_KNOWLEDGE.frequentlyAskedQuestions,
      timings: PROJECT_KNOWLEDGE.operatingHours,
      rules: PROJECT_KNOWLEDGE.borrowingRules,
    },
  });
}

module.exports = {
  handleChatMessage,
  getChatFaq,
  generateAssistantReply,
};
