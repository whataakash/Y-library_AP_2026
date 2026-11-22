// Express Application Setup
const express = require("express");
const cors = require("cors");

// Import route handlers
const bookRoutes = require("./routes/book.routes");
const borrowRoutes = require("./routes/borrow.routes");

const app = express();

// Middleware
app.use(cors()); // Allow frontend (React on port 5173) to communicate with backend
app.use(express.json()); // Parse incoming JSON request bodies

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Y-Library Express API is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/books", bookRoutes);
app.use("/api/borrow", borrowRoutes);

// Global Error Handler for beginners
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred",
  });
});

module.exports = app;
