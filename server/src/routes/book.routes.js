// Book Routes
const express = require("express");
const router = express.Router();
const bookController = require("../controllers/book.controller");

// Route: GET /api/books (Fetch all books with search, genre, and tag query options)
router.get("/", bookController.getAllBooks);

// Route: GET /api/books/:id (Fetch one book by its primary key ID)
router.get("/:id", bookController.getBookById);

// Route: POST /api/books (Add a new book to the library catalog)
router.post("/", bookController.createBook);

// Route: PUT /api/books/:id (Update book information or physical location)
router.put("/:id", bookController.updateBook);

// Route: DELETE /api/books/:id (Delete book from catalog)
router.delete("/:id", bookController.deleteBook);

module.exports = router;
