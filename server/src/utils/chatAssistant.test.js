// server/src/utils/chatAssistant.test.js
// Unit verification suite for Y-Library Chatbot controller and response generator

const { generateAssistantReply } = require("../controllers/chat.controller");

async function runTests() {
  console.log("=== Running Y-Library AI Chatbot Controller Tests ===");

  const testCases = [
    {
      name: "Greeting with student enrollment details",
      query: "Hello there!",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "Aarav Sharma",
    },
    {
      name: "Project overview and purpose",
      query: "What is the purpose of this project?",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "Y-Library",
    },
    {
      name: "Operating hours inquiry",
      query: "When is the library open?",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "Monday – Friday",
    },
    {
      name: "Borrowing rules and loan limits",
      query: "What are the borrowing rules?",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "14 days",
    },
    {
      name: "PostgreSQL database schema explanation",
      query: "Explain the database schema and tables",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "books",
    },
    {
      name: "Physical shelf locations",
      query: "Where are Computer Science books located?",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "East Wing",
    },
    {
      name: "Faculty viva explanation",
      query: "Explain how multi-tag searching works for faculty viva",
      student: "Aarav Sharma",
      enrollment: "EN2026101",
      expectContains: "PostgreSQL",
    },
  ];

  let passed = 0;

  for (const tc of testCases) {
    try {
      const res = await generateAssistantReply(tc.query, tc.student, tc.enrollment);
      if (res && res.text && res.text.includes(tc.expectContains)) {
        console.log(`[PASS] ${tc.name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${tc.name} - Expected to find "${tc.expectContains}" in reply.`);
      }
    } catch (err) {
      console.error(`[ERROR] ${tc.name} threw error:`, err.message);
    }
  }

  console.log(`=== Tests Complete: ${passed} / ${testCases.length} Passed ===\n`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
