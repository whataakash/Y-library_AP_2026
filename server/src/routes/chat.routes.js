// server/src/routes/chat.routes.js
// Express Router for AI Chat Assistant Endpoints

const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// Route: POST /api/chat/message (Send query to AI assistant with student name & enrollment ID)
router.post("/message", chatController.handleChatMessage);

// Route: GET /api/chat/faq (Fetch library FAQs and project knowledge)
router.get("/faq", chatController.getChatFaq);

module.exports = router;
