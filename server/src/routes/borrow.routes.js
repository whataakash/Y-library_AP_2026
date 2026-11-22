// Borrow Routes
const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrow.controller");

// Route: POST /api/borrow (Borrow a book, decrements available count)
router.post("/", borrowController.borrowBook);

// Route: POST /api/borrow/return/:id (Return a borrowed book, increments available count)
router.post("/return/:id", borrowController.returnBook);

// Route: GET /api/borrow/user/:email (Get student's active loans and borrow history)
router.get("/user/:email", borrowController.getUserBorrows);

module.exports = router;
