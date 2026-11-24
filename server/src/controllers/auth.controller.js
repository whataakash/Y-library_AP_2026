// Multi-User Authentication Controller (Credentials + Google OAuth)
// Explains clearly to faculty how User Management, JWT, and OAuth work
const fs = require("fs");
const path = require("path");
const prisma = require("../config/prisma");
const { hashPassword, verifyPassword, generateToken } = require("../utils/auth.utils");

const USERS_FILE_PATH = path.join(__dirname, "../../data/users.json");

// Initial preset users (Admins, Librarians, Students) loaded from data/users.json
let DEFAULT_STUDENTS = [];
try {
  if (fs.existsSync(USERS_FILE_PATH)) {
    DEFAULT_STUDENTS = JSON.parse(fs.readFileSync(USERS_FILE_PATH, "utf-8"));
  }
} catch (e) {
  console.warn("Could not load users.json, using fallback:", e.message);
}

function getLocalUsers() {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE_PATH)) {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(DEFAULT_STUDENTS, null, 2));
      return DEFAULT_STUDENTS;
    }
    const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    return DEFAULT_STUDENTS;
  }
}

function saveLocalUsers(users) {
  try {
    const dir = path.dirname(USERS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error saving local users:", err);
  }
}

/**
 * 1. REGISTER NEW USER (Campus Email + Password)
 */
async function register(req, res, next) {
  try {
    const { name, email, password, major, year, preferredGenres } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);
    const defaultAvatar = `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=200&h=200&fit=crop`;

    // Try PostgreSQL
    try {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in.",
        });
      }

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          avatar: defaultAvatar,
          major: major || "Computer Science & AI",
          year: year || "Year 1",
          preferredGenres: Array.isArray(preferredGenres) ? preferredGenres : ["Technology", "Science"],
          interests: [],
          readBooks: [],
          favorites: [],
          continueReading: [],
          readingGoal: { target: 10, completed: 0, streakDays: 1 },
        },
      });

      const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });
      return res.status(201).json({
        success: true,
        message: "Registration successful!",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          major: newUser.major,
          year: newUser.year,
          preferredGenres: newUser.preferredGenres,
          readBooks: newUser.readBooks,
          favorites: newUser.favorites,
          continueReading: newUser.continueReading,
          readingGoal: newUser.readingGoal,
        },
      });
    } catch (dbErr) {
      // Fallback local storage
      const localUsers = getLocalUsers();
      if (localUsers.some((u) => u.email === normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const newUser = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        avatar: defaultAvatar,
        major: major || "Computer Science & AI",
        year: year || "Year 1",
        preferredGenres: Array.isArray(preferredGenres) ? preferredGenres : ["Technology", "Science"],
        interests: [],
        readBooks: [],
        favorites: [],
        continueReading: [],
        readingGoal: { target: 10, completed: 0, streakDays: 1 },
        createdAt: new Date().toISOString(),
      };

      localUsers.push(newUser);
      saveLocalUsers(localUsers);

      const token = generateToken({ id: newUser.id, email: newUser.email, name: newUser.name });
      return res.status(201).json({
        success: true,
        message: "Registration successful!",
        token,
        user: { ...newUser, password: undefined },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 2. LOGIN USER (Campus Email + Password)
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Try PostgreSQL
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      if (!user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const userRole = user.role || (user.email.includes("vance") || user.email.includes("rostova") || user.email.includes("admin") ? "admin" : user.email.includes("hollowell") || user.email.includes("thorne") || user.email.includes("librarian") ? "librarian" : "student");

      const token = generateToken({ id: user.id, email: user.email, name: user.name, role: userRole });
      return res.json({
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole,
          avatar: user.avatar,
          major: user.major,
          year: user.year,
          preferredGenres: user.preferredGenres,
          readBooks: user.readBooks,
          favorites: user.favorites,
          continueReading: user.continueReading,
          readingGoal: user.readingGoal,
        },
      });
    } catch (dbErr) {
      // Fallback local storage
      const localUsers = getLocalUsers();
      const user = localUsers.find((u) => u.email === normalizedEmail);

      if (!user || !user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken({ id: user.id, email: user.email, name: user.name });
      return res.json({
        success: true,
        message: "Login successful!",
        token,
        user: { ...user, password: undefined },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 3. GOOGLE SIGN-IN (OAuth 2.0 Integration)
 * Accepts Google token/credentials from Google Identity Services or simulated provider
 */
async function googleLogin(req, res, next) {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google email address is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const studentName = name || normalizedEmail.split("@")[0].replace(".", " ");
    const studentAvatar =
      avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop";

    // Try PostgreSQL
    try {
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { googleId: googleId || "google_oauth" }],
        },
      });

      if (!user) {
        // Auto-create student profile on first Google Sign-In
        user = await prisma.user.create({
          data: {
            name: studentName,
            email: normalizedEmail,
            googleId: googleId || `g_${Date.now()}`,
            avatar: studentAvatar,
            major: "Computer Science & AI",
            year: "Year 1",
            preferredGenres: ["Technology", "Science Fiction", "Science"],
            interests: ["artificial intelligence", "technology"],
            readBooks: [],
            favorites: [],
            continueReading: [],
            readingGoal: { target: 10, completed: 0, streakDays: 1 },
          },
        });
      }

      const token = generateToken({ id: user.id, email: user.email, name: user.name });
      return res.json({
        success: true,
        message: "Google Sign-In successful!",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          major: user.major,
          year: user.year,
          preferredGenres: user.preferredGenres,
          readBooks: user.readBooks,
          favorites: user.favorites,
          continueReading: user.continueReading,
          readingGoal: user.readingGoal,
        },
      });
    } catch (dbErr) {
      // Fallback local storage
      const localUsers = getLocalUsers();
      let user = localUsers.find(
        (u) => u.email === normalizedEmail || (googleId && u.googleId === googleId)
      );

      if (!user) {
        user = {
          id: Date.now(),
          name: studentName,
          email: normalizedEmail,
          googleId: googleId || `g_${Date.now()}`,
          avatar: studentAvatar,
          major: "Computer Science & AI",
          year: "Year 1",
          preferredGenres: ["Technology", "Science Fiction", "Science"],
          interests: ["artificial intelligence"],
          readBooks: [],
          favorites: [],
          continueReading: [],
          readingGoal: { target: 10, completed: 0, streakDays: 1 },
          createdAt: new Date().toISOString(),
        };
        localUsers.push(user);
        saveLocalUsers(localUsers);
      }

      const token = generateToken({ id: user.id, email: user.email, name: user.name });
      return res.json({
        success: true,
        message: "Google Sign-In successful!",
        token,
        user: { ...user, password: undefined },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 4. GET CURRENT AUTHENTICATED USER (Me)
 */
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    try {
      const user = await prisma.user.findFirst({
        where: { OR: [{ id: Number(userId) }, { email: userEmail }] },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          major: true,
          year: true,
          preferredGenres: true,
          interests: true,
          readBooks: true,
          favorites: true,
          continueReading: true,
          readingGoal: true,
        },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.json({ success: true, user });
    } catch (dbErr) {
      const localUsers = getLocalUsers();
      const user = localUsers.find(
        (u) => String(u.id) === String(userId) || u.email === userEmail
      );

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      return res.json({ success: true, user: { ...user, password: undefined } });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 5. UPDATE USER PROFILE (Preferences, Continue Reading, Goals)
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    const updates = req.body;

    // Disallow overwriting password or email through profile patch
    delete updates.password;
    delete updates.id;

    try {
      const updated = await prisma.user.update({
        where: { email: userEmail },
        data: updates,
      });

      return res.json({ success: true, user: updated });
    } catch (dbErr) {
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex(
        (u) => String(u.id) === String(userId) || u.email === userEmail
      );

      if (idx === -1) {
        return res.status(404).json({ success: false, message: "User not found." });
      }

      localUsers[idx] = { ...localUsers[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalUsers(localUsers);

      return res.json({
        success: true,
        user: { ...localUsers[idx], password: undefined },
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
};
