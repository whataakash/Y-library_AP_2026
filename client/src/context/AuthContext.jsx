import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const defaultUser = {
    name: "Maya Chen",
    email: "maya.chen@y-university.edu",
    major: "Architecture · Year 3",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    readBooks: ["gbook_1", "gbook_3"],
    favorites: ["gbook_1"],
    currentlyReading: "gbook_2",
  };

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("y_library_user_profile");
    return saved ? JSON.parse(saved) : defaultUser;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("y_library_user_profile", JSON.stringify(user));
    }
  }, [user]);

  // Profile curation actions (handling string and number IDs)
  const markAsRead = (bookId) => {
    setUser((prev) => {
      const exists = prev.readBooks.some((id) => String(id) === String(bookId));
      const updated = exists
        ? prev.readBooks.filter((id) => String(id) !== String(bookId))
        : [...prev.readBooks, String(bookId)];
      return { ...prev, readBooks: updated };
    });
  };

  const toggleFavorite = (bookId) => {
    setUser((prev) => {
      const exists = prev.favorites.some((id) => String(id) === String(bookId));
      const updated = exists
        ? prev.favorites.filter((id) => String(id) !== String(bookId))
        : [...prev.favorites, String(bookId)];
      return { ...prev, favorites: updated };
    });
  };

  const login = (email) => {
    setUser({
      ...defaultUser,
      name: email.split("@")[0].replace(".", " "),
      email,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        markAsRead,
        toggleFavorite,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
