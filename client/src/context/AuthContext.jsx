import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext();

// Pre-configured demo accounts for faculty testing & presentation
// 2 Admins, 2 Librarians, 5 Students
export const DEMO_STUDENTS = [
  // 1. ADMINS (2)
  {
    id: 1,
    name: "Dr. Arthur Vance",
    email: "arthur.vance@y-university.edu",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    major: "Campus Dean of Academic Affairs & Systems",
    year: "Administration Staff",
    preferredGenres: ["Technology", "Economics", "Philosophy", "History"],
    interests: ["university policy", "systems architecture", "governance", "higher education"],
    readBooks: ["9781501124020", "9780812979183"],
    favorites: ["9781501124020", "9780812979183"],
    continueReading: [
      {
        bookId: "9781501124020",
        title: "Principles: Life and Work",
        author: "Ray Dalio",
        cover: "https://covers.openlibrary.org/b/id/8315355-L.jpg",
        chapter: "Part 2 · Life Principles",
        progress: 72,
        lastRead: "Yesterday",
      },
    ],
    readingGoal: { target: 20, completed: 15, streakDays: 45 },
  },
  {
    id: 2,
    name: "Elena Rostova",
    email: "elena.rostova@y-university.edu",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    major: "Director of Library Information Systems",
    year: "System Operations",
    preferredGenres: ["Technology", "Science", "Business", "Mathematics"],
    interests: ["database systems", "information security", "catalog auditing", "open access"],
    readBooks: ["9780753555187"],
    favorites: ["9780753555187"],
    continueReading: [
      {
        bookId: "9780753555187",
        title: "Zero to One",
        author: "Peter Thiel",
        cover: "https://covers.openlibrary.org/b/id/9002334-L.jpg",
        chapter: "Ch. 3 · All Happy Companies Are Different",
        progress: 88,
        lastRead: "2 days ago",
      },
    ],
    readingGoal: { target: 18, completed: 12, streakDays: 30 },
  },

  // 2. LIBRARIANS (2)
  {
    id: 3,
    name: "Margaret Hollowell",
    email: "margaret.hollowell@y-university.edu",
    role: "librarian",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    major: "Head of Collections & Rare Manuscripts",
    year: "Senior Cataloger",
    preferredGenres: ["History", "Classics", "Philosophy", "Art & Design"],
    interests: ["archival preservation", "historical manuscripts", "catalog classification"],
    readBooks: ["9780241300657"],
    favorites: ["9780241300657"],
    continueReading: [
      {
        bookId: "9780241300657",
        title: "Skin in the Game",
        author: "Nassim Nicholas Taleb",
        cover: "https://covers.openlibrary.org/b/id/10856868-L.jpg",
        chapter: "Ch. 5 · The Logic of Risk Taking",
        progress: 55,
        lastRead: "3 hours ago",
      },
    ],
    readingGoal: { target: 25, completed: 19, streakDays: 60 },
  },
  {
    id: 4,
    name: "Samuel Thorne",
    email: "samuel.thorne@y-university.edu",
    role: "librarian",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    major: "Research & Circulation Librarian",
    year: "Circulation Desk Lead",
    preferredGenres: ["Science Fiction", "Science", "Technology", "Fantasy"],
    interests: ["reference research", "student outreach", "digital archives"],
    readBooks: ["9781846141577"],
    favorites: ["9781846141577"],
    continueReading: [
      {
        bookId: "9781846141577",
        title: "Antifragile: Things That Gain from Disorder",
        author: "Nassim Nicholas Taleb",
        cover: "https://covers.openlibrary.org/b/id/9180157-L.jpg",
        chapter: "Book 1 · The Antifragile: An Introduction",
        progress: 60,
        lastRead: "5 hours ago",
      },
    ],
    readingGoal: { target: 20, completed: 14, streakDays: 28 },
  },

  // 3. STUDENTS (5)
  {
    id: 5,
    name: "Alex Morgan",
    email: "alex.morgan@y-university.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    major: "Computer Science & AI",
    year: "Senior (Year 4)",
    preferredGenres: ["Technology", "Science Fiction", "Mathematics", "Science"],
    interests: ["artificial intelligence", "algorithms", "machine learning", "python"],
    readBooks: ["9780753555187"],
    favorites: ["9780753555187"],
    continueReading: [
      {
        bookId: "9780753555187",
        title: "Zero to One",
        author: "Peter Thiel",
        cover: "https://covers.openlibrary.org/b/id/9002334-L.jpg",
        chapter: "Ch. 4 · The Ideology of Competition",
        progress: 68,
        lastRead: "2 hours ago",
      },
    ],
    readingGoal: { target: 12, completed: 8, streakDays: 14 },
  },
  {
    id: 6,
    name: "Maya Chen",
    email: "maya.chen@y-university.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    major: "Architecture & Urban Design",
    year: "Junior (Year 3)",
    preferredGenres: ["History", "Philosophy", "Classics", "Art & Design"],
    interests: ["sustainable urbanism", "biophilic design", "architectural history"],
    readBooks: ["9780241300657"],
    favorites: ["9780241300657"],
    continueReading: [
      {
        bookId: "9780241300657",
        title: "Skin in the Game",
        author: "Nassim Nicholas Taleb",
        cover: "https://covers.openlibrary.org/b/id/10856868-L.jpg",
        chapter: "Ch. 8 · Symmetry in Risk",
        progress: 82,
        lastRead: "Yesterday",
      },
    ],
    readingGoal: { target: 15, completed: 10, streakDays: 21 },
  },
  {
    id: 7,
    name: "Jordan Lee",
    email: "jordan.lee@y-university.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    major: "Economics & Financial Markets",
    year: "Sophomore (Year 2)",
    preferredGenres: ["Economics", "Business", "Psychology", "History"],
    interests: ["behavioral economics", "macroeconomics", "portfolio theory"],
    readBooks: ["9782361170561", "9782909356105"],
    favorites: ["9782361170561", "9782909356105"],
    continueReading: [
      {
        bookId: "9782361170561",
        title: "The Psychology of Money",
        author: "Morgan Housel",
        cover: "https://covers.openlibrary.org/b/id/10389354-L.jpg",
        chapter: "Ch. 7 · Freedom",
        progress: 45,
        lastRead: "4 hours ago",
      },
    ],
    readingGoal: { target: 14, completed: 9, streakDays: 16 },
  },
  {
    id: 8,
    name: "Priya Sharma",
    email: "priya.sharma@y-university.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop",
    major: "Data Science & Computational Linguistics",
    year: "Freshman (Year 1)",
    preferredGenres: ["Technology", "Science", "Philosophy", "Psychology"],
    interests: ["natural language processing", "semantic networks", "cognitive science"],
    readBooks: ["9781464166174"],
    favorites: ["9781464166174"],
    continueReading: [
      {
        bookId: "9781464166174",
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        cover: "https://covers.openlibrary.org/b/id/13290711-L.jpg",
        chapter: "Part 1 · Two Systems",
        progress: 30,
        lastRead: "5 hours ago",
      },
    ],
    readingGoal: { target: 10, completed: 5, streakDays: 9 },
  },
  {
    id: 9,
    name: "Marcus Aurelius Davies",
    email: "marcus.davies@y-university.edu",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&h=200&fit=crop",
    major: "Classical Literature & Moral Philosophy",
    year: "Senior (Year 4)",
    preferredGenres: ["Philosophy", "Classics", "History", "General Fiction"],
    interests: ["stoicism", "epistemology", "ancient greek literature", "ethics"],
    readBooks: ["9781544514208", "9780812979183"],
    favorites: ["9781544514208", "9780812979183"],
    continueReading: [
      {
        bookId: "9781544514208",
        title: "The Almanack of Naval Ravikant",
        author: "Eric Jorgenson",
        cover: "https://covers.openlibrary.org/b/id/10449931-L.jpg",
        chapter: "Building Judgment",
        progress: 90,
        lastRead: "1 hour ago",
      },
    ],
    readingGoal: { target: 16, completed: 13, streakDays: 35 },
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("ylib_current_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null; // Defaults to null: Unauthenticated visitor sees Landing Page
  });

  const [loading, setLoading] = useState(true);

  // Hydrate user session from Express backend token
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("ylib_jwt_token");
      if (token) {
        try {
          const profile = await authApi.getMe();
          if (profile) {
            setUser(profile);
            localStorage.setItem("ylib_current_user", JSON.stringify(profile));
          }
        } catch (err) {
          console.warn("Session check fallback:", err.message);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  // Sync user state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem("ylib_current_user", JSON.stringify(user));
    }
  }, [user]);

  // 1. Email & Password Login
  const loginWithCredentials = async (email, password) => {
    const res = await authApi.login(email, password);
    setUser(res.user);
    return res.user;
  };

  // 2. Email & Password Registration
  const registerWithCredentials = async (data) => {
    const res = await authApi.register(data);
    setUser(res.user);
    return res.user;
  };

  // 3. Google Sign-In
  const loginWithGoogle = async (googleUser) => {
    const res = await authApi.googleLogin(googleUser);
    setUser(res.user);
    return res.user;
  };

  // 4. Logout
  const logout = () => {
    authApi.logout();
    localStorage.removeItem("ylib_current_user");
    setUser(null);
  };

  // 5. Update user profile & persist to backend
  const updateUserProfile = async (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      authApi.updateProfile(updates).catch(() => {});
      return updated;
    });
  };

  // 6. Toggle a genre preference on/off
  const toggleGenrePreference = (genre) => {
    setUser((prev) => {
      if (!prev) return prev;
      const current = prev.preferredGenres || [];
      const exists = current.includes(genre);
      const updated = exists ? current.filter((g) => g !== genre) : [...current, genre];
      const newProfile = { ...prev, preferredGenres: updated };
      authApi.updateProfile({ preferredGenres: updated }).catch(() => {});
      return newProfile;
    });
  };

  // 7. Start reading or update progress for a book
  const startOrUpdateReading = (book, chapter = "Chapter 1", progress = 10) => {
    if (!book) return;
    const bId = String(book.id || book.isbn);
    const cover = book.coverImg || book.book_image || book.bookImage || "";

    setUser((prev) => {
      if (!prev) return prev;
      const currentList = prev.continueReading || [];
      const existingIdx = currentList.findIndex(
        (item) => String(item.bookId) === bId || String(item.id) === bId
      );

      const updatedEntry = {
        bookId: bId,
        id: bId,
        title: book.title || book.bookname,
        author: book.author,
        cover,
        chapter: chapter || (existingIdx >= 0 ? currentList[existingIdx].chapter : "Chapter 1"),
        progress: progress !== undefined ? progress : (existingIdx >= 0 ? currentList[existingIdx].progress : 15),
        lastRead: "Just now",
      };

      let newList;
      if (existingIdx >= 0) {
        newList = [...currentList];
        newList[existingIdx] = updatedEntry;
      } else {
        newList = [updatedEntry, ...currentList];
      }

      const updated = { ...prev, continueReading: newList };
      authApi.updateProfile({ continueReading: newList }).catch(() => {});
      return updated;
    });
  };

  // 8. Remove from continue reading
  const removeContinueReading = (bookId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const filtered = (prev.continueReading || []).filter(
        (item) => String(item.bookId) !== String(bookId) && String(item.id) !== String(bookId)
      );
      const updated = { ...prev, continueReading: filtered };
      authApi.updateProfile({ continueReading: filtered }).catch(() => {});
      return updated;
    });
  };

  // 9. Mark book as read
  const markAsRead = (bookId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const exists = (prev.readBooks || []).some((id) => String(id) === String(bookId));
      const updatedRead = exists
        ? prev.readBooks.filter((id) => String(id) !== String(bookId))
        : [...(prev.readBooks || []), String(bookId)];

      const currentGoal = prev.readingGoal || { target: 10, completed: 5 };
      const newGoal = {
        ...currentGoal,
        completed: exists ? Math.max(0, currentGoal.completed - 1) : currentGoal.completed + 1,
      };

      const updated = { ...prev, readBooks: updatedRead, readingGoal: newGoal };
      authApi.updateProfile({ readBooks: updatedRead, readingGoal: newGoal }).catch(() => {});
      return updated;
    });
  };

  // 10. Toggle favorite
  const toggleFavorite = (bookId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const exists = (prev.favorites || []).some((id) => String(id) === String(bookId));
      const updatedFavs = exists
        ? prev.favorites.filter((id) => String(id) !== String(bookId))
        : [...(prev.favorites || []), String(bookId)];

      const updated = { ...prev, favorites: updatedFavs };
      authApi.updateProfile({ favorites: updatedFavs }).catch(() => {});
      return updated;
    });
  };

  // 11. Quick switch demo student (for faculty demo convenience)
  const switchDemoStudent = (email) => {
    const student = DEMO_STUDENTS.find((s) => s.email === email) || DEMO_STUDENTS[0];
    setUser(student);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users: DEMO_STUDENTS,
        isAuthenticated: !!user,
        loading,
        loginWithCredentials,
        registerWithCredentials,
        loginWithGoogle,
        logout,
        updateUserProfile,
        toggleGenrePreference,
        startOrUpdateReading,
        removeContinueReading,
        markAsRead,
        toggleFavorite,
        switchDemoStudent,
        switchUser: (idOrEmail) => {
          const student =
            DEMO_STUDENTS.find((s) => s.id === idOrEmail || s.email === idOrEmail) ||
            DEMO_STUDENTS[0];
          setUser(student);
        },
        createUserProfile: (data) => registerWithCredentials(data),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
