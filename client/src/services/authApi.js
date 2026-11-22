// Y-Library Client Auth API Service
// Express Backend Authentication (Credentials + Google OAuth)

const BACKEND_AUTH_URL = "http://localhost:5001/api/auth";

export const authApi = {
  // 1. Register with email & password
  register: async ({ name, email, password, major, year, preferredGenres }) => {
    const res = await fetch(`${BACKEND_AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, major, year, preferredGenres }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    if (data.token) {
      localStorage.setItem("ylib_jwt_token", data.token);
    }
    return data;
  },

  // 2. Login with email & password
  login: async (email, password) => {
    const res = await fetch(`${BACKEND_AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    if (data.token) {
      localStorage.setItem("ylib_jwt_token", data.token);
    }
    return data;
  },

  // 3. Google Sign-In / OAuth
  googleLogin: async ({ email, name, avatar, googleId }) => {
    const res = await fetch(`${BACKEND_AUTH_URL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, avatar, googleId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Google Sign-In failed");

    if (data.token) {
      localStorage.setItem("ylib_jwt_token", data.token);
    }
    return data;
  },

  // 4. Get Current User (Me)
  getMe: async () => {
    const token = localStorage.getItem("ylib_jwt_token");
    if (!token) return null;

    try {
      const res = await fetch(`${BACKEND_AUTH_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("ylib_jwt_token");
        return null;
      }

      const data = await res.json();
      return data.user;
    } catch (err) {
      return null;
    }
  },

  // 5. Update Profile & Preferences
  updateProfile: async (updates) => {
    const token = localStorage.getItem("ylib_jwt_token");
    if (!token) return null;

    const res = await fetch(`${BACKEND_AUTH_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update profile");
    return data.user;
  },

  // 6. Sign Out
  logout: () => {
    localStorage.removeItem("ylib_jwt_token");
  },
};
