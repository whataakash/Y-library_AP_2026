// Authentication Routes for Y-Library
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

// 1. Register with email & password
router.post("/register", authController.register);

// 2. Login with email & password
router.post("/login", authController.login);

// 3. Google Sign-In / OAuth
router.post("/google", authController.googleLogin);

// 4. Get Current User Profile (Protected)
router.get("/me", requireAuth, authController.getMe);

// 5. Update Profile & Reading Progress (Protected)
router.put("/profile", requireAuth, authController.updateProfile);

module.exports = router;
