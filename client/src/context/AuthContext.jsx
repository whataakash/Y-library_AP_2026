import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext();

// Pre-configured demo student accounts for faculty testing
export const DEMO_STUDENTS = [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex.morgan@y-university.edu",
    major: "Computer Science & AI",
    year: "Senior (Year 4)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    preferredGenres: ["Technology", "Science Fiction", "Mathematics", "Science"],
    interests: ["artificial intelligence", "algorithms", "machine learning", "python"],
    readBooks: ["gbook_1", "gbook_4"],
    favorites: ["gbook_1", "gbook_14"],
    continueReading: [
      {
        bookId: "gbook_1",
        title: "Clean Code",
        author: "Robert C. Martin",
        cover: "https://covers.openlibrary.org/b/id/1094406-L.jpg",
        chapter: "Ch. 3 · Functions & Meaningful Names",
        progress: 68,
        lastRead: "2 hours ago",
      },
    ],
    readingGoal: { target: 12, completed: 8, streakDays: 14 },
  },
  {
    id: 2,
    name: "Maya Chen",
    email: "maya.chen@y-university.edu",
    major: "Architecture & Urban Design",
    year: "Junior (Year 3)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    preferredGenres: ["History", "Philosophy", "Classics", "General Fiction"],
    interests: ["architecture", "design", "urbanism", "history"],
    readBooks: ["gbook_2"],
    favorites: ["gbook_2"],
    continueReading: [
      {
        bookId: "gbook_2",
        title: "Architecture: Form, Space, & Order",
        author: "Francis D. K. Ching",
        cover: "https://covers.openlibrary.org/b/id/8314120-L.jpg",
        chapter: "Ch. 4 · Spatial Enclosures",
        progress: 84,
        lastRead: "3 hours ago",
      },
    ],
    readingGoal: { target: 15, completed: 10, streakDays: 21 },
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
    return DEMO_STUDENTS[0];
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
