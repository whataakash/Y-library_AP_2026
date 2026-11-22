// Y-Library Data & API Service
// Express.js Backend + PostgreSQL (Prisma) + Google Books API Fallback
// Written cleanly for beginner understanding and faculty presentation

export const BACKEND_URL = "http://localhost:5001/api";

// Helper: Normalizes a PostgreSQL Book record from our Express backend
// Ensures fields match both backend schema (bookname, bookImage, availableCount, tags)
// and frontend UI components (title, coverImg, copies, totalCopies)
function normalizeBackendBook(b) {
  const cover = b.book_image || b.bookImage || `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg`;
  const available = b.available_count !== undefined ? b.available_count : b.availableCount !== undefined ? b.availableCount : 1;
  const total = b.total_count !== undefined ? b.total_count : b.totalCount !== undefined ? b.totalCount : 1;

  return {
    id: b.id,
    title: b.bookname,
    bookname: b.bookname,
    author: b.author,
    isbn: b.isbn,
    rating: String(b.rating || "4.5"),
    reviewsCount: (b.borrowRecords ? b.borrowRecords.length : 0) + 18,
    status: available > 0 ? "Available" : "Checked Out",
    genre: b.genre,
    tags: Array.isArray(b.tags) ? b.tags : [b.genre],
    coverImg: cover,
    bookImage: cover,
    book_image: cover,
    location: b.location,
    copies: available,
    available_count: available,
    availableCount: available,
    totalCopies: total,
    total_count: total,
    totalCount: total,
    edition: b.edition || "1st Edition",
    price: "Free Campus Loan",
    summary: `${b.bookname} by ${b.author}. Campus Shelf: ${b.location}. Available copies: ${available} of ${total}.`,
    eli5Summary: `A fun book called "${b.bookname}"! You can find it on shelf ${b.location} in the university library.`,
    eli10Summary: `"${b.bookname}" is written by ${b.author}. It is currently catalogued in ${b.location} with edition ${b.edition}.`,
    readers: ["Maya Chen", "Idris Okafor", "Sofia Reyes"],
    borrowRecords: b.borrowRecords || [],
    peerReviews: [
      {
        user: "Sofia Reyes",
        rating: 5,
        comment: `Found this on ${b.location}, copy was in great condition.`,
        date: "Recently",
      },
    ],
  };
}

// Default fallback books for instant display / offline reliability
const FALLBACK_BOOKS = [
  {
    id: "gbook_1",
    title: "The Secret History",
    author: "Donna Tartt",
    isbn: "9781400031702",
    rating: "4.8",
    reviewsCount: 38,
    status: "Available",
    genre: "Fiction",
    tags: ["Campus Read", "Dark Academia", "Mystery"],
    coverImg: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop",
    location: "East Library · Level 3, Shelf B-14",
    copies: 3,
    totalCopies: 4,
    price: "Free Campus Loan",
    summary:
      "Donna Tartt's dark campus classic. A group of eccentric classics students at an elite Vermont college discover a dangerous way of thinking and living.",
    eli5Summary:
      "A story about college friends who love ancient myths, but they learn that making bad choices has serious consequences!",
    eli10Summary:
      "Richard joins a secret club studying ancient Greek. They try to recreate ancient rituals, which goes wrong and turns into an intense mystery.",
    readers: ["Maya Chen", "Idris Okafor", "Sofia Reyes"],
  },
  {
    id: "gbook_2",
    title: "Braiding Sweetgrass",
    author: "Robin Wall Kimmerer",
    isbn: "9781571313560",
    rating: "4.9",
    reviewsCount: 52,
    status: "Available",
    genre: "Nature",
    tags: ["Indigenous Wisdom", "Ecology", "Botanical"],
    coverImg: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800&fit=crop",
    location: "Main Library · Level 2, Shelf N-02",
    copies: 2,
    totalCopies: 3,
    price: "Free Campus Loan",
    summary:
      "An indigenous scientist shows how living beings offer us gifts, exploring reciprocal relationships between plants and humans.",
    eli5Summary: "Nature is a friendly garden that shares sweet strawberries and teaches us to be kind and say thank you!",
    eli10Summary: "A Potawatomi botanist combines modern botany with Native teachings to show how trees and rivers sustain us.",
    readers: ["Idris Okafor", "Leo Hoffman"],
  },
  {
    id: "gbook_3",
    title: "The Left Hand of Darkness",
    author: "Ursula K. Le Guin",
    isbn: "9780441478125",
    rating: "4.7",
    reviewsCount: 29,
    status: "Available",
    genre: "Sci-Fi",
    tags: ["Classic Sci-Fi", "Philosophy", "Winter Planet"],
    coverImg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=800&fit=crop",
    location: "Science Library · Level 4, Shelf S-19",
    copies: 1,
    totalCopies: 2,
    price: "Free Campus Loan",
    summary: "A human envoy travels to the frozen planet of Gethen, exploring deep politics, trust, and winter survival.",
    eli5Summary: "An explorer visits a snowy world and teams up with an alien friend to pull a sled across giant glaciers.",
    eli10Summary: "An ambassador must cross an 800-mile ice sheet to unite a frozen world without prejudice.",
    readers: ["Maya Chen", "Sofia Reyes"],
  },
  {
    id: "gbook_4",
    title: "Ways of Seeing",
    author: "John Berger",
    isbn: "9780140135152",
    rating: "4.6",
    reviewsCount: 44,
    status: "Available",
    genre: "Art & Design",
    tags: ["Visual Culture", "Media Theory", "Art History"],
    coverImg: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&h=800&fit=crop",
    location: "Art Annex · Level 2, Shelf A-08",
    copies: 2,
    totalCopies: 3,
    price: "Free Campus Loan",
    summary: "A landmark work exploring how we evaluate images, oil paintings, and advertising in modern culture.",
    eli5Summary: "Pictures try to tell us stories! This book teaches you to look closely and think for yourself.",
    eli10Summary: "Learn how museum oil paintings and modern billboard ads use secret visual codes to influence society.",
    readers: ["Julian Vance", "Maya Chen"],
  },
  {
    id: "gbook_5",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author: "Gabrielle Zevin",
    isbn: "9780593321201",
    rating: "4.7",
    reviewsCount: 61,
    status: "Available",
    genre: "Fiction",
    tags: ["Game Design", "Friendship", "Tech & Art"],
    coverImg: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=800&fit=crop",
    location: "East Library · Level 3, Shelf F-09",
    copies: 2,
    totalCopies: 4,
    price: "Free Campus Loan",
    summary: "Two college friends build blockbuster video games while navigating creative partnership, love, and tragedy.",
    eli5Summary: "Two best friends create fun pixel video game adventures for everyone to play!",
    eli10Summary: "Follows two indie game designers from college whose shared passion changes their lives forever.",
    readers: ["Idris Okafor", "Sofia Reyes"],
  },
];

// Helper to convert Google Books item into a rich campus book object
function formatGoogleBook(item, index = 0) {
  const info = item.volumeInfo || {};
  const isbnObj =
    info.industryIdentifiers?.find((id) => id.type === "ISBN_13") ||
    info.industryIdentifiers?.[0];
  const isbn = isbnObj ? isbnObj.identifier : `GB-${item.id}`;

  let coverImg =
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  coverImg = coverImg.replace("http://", "https://");

  const campusLocations = [
    "East Library · Level 3, Shelf B-14",
    "Main Library · Level 2, Shelf N-02",
    "Science Library · Level 4, Shelf S-19",
    "Art Annex · Level 2, Shelf A-08",
    "West Wing · Level 2, Shelf H-14",
    "Reading Hall · Level 1, Shelf D-01",
    "North Stack · Level 5, Shelf K-09",
    "Undergrad Commons · Level 1, Shelf C-03",
  ];
  const location = campusLocations[index % campusLocations.length];

  let summary = info.description || "A campus catalogue title available for student loan.";
  if (summary.length > 220) {
    summary = summary.slice(0, 220).replace(/<[^>]+>/g, "") + "...";
  }

  const category = info.categories ? info.categories[0] : "General";

  return {
    id: item.id,
    title: info.title || "Untitled Book",
    bookname: info.title || "Untitled Book",
    author: info.authors ? info.authors.join(", ") : "Unknown Author",
    isbn: isbn,
    rating: info.averageRating ? String(info.averageRating) : "4.6",
    reviewsCount: info.ratingsCount || 18,
    status: "Available",
    genre: category,
    tags: [category, "Google Books", "Campus Edition"],
    coverImg: coverImg,
    bookImage: coverImg,
    location: location,
    copies: 2 + (index % 3),
    totalCopies: 4,
    edition: "Campus Edition",
    price: "Free Campus Loan",
    summary: summary,
    fullDescription: (info.description || summary).replace(/<[^>]+>/g, ""),
    readers: ["Maya Chen", "Idris Okafor"],
    peerReviews: [
      {
        user: "Sofia Reyes",
        rating: 5,
        comment: "Excellent read, picked it up directly from the physical shelf yesterday.",
        date: "Recently",
      },
    ],
  };
}

let googleBooksCache = [];

export const api = {
  // 1. Fetch books: First checks Express + PostgreSQL backend;
  // If backend is offline or empty, falls back seamlessly to Google Books API
  getBooks: async (query = "", genre = "All", tag = "") => {
    // A) Try Express Backend (PostgreSQL via Prisma)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());
      if (genre && genre !== "All") params.append("genre", genre);
      if (tag) params.append("tag", tag);

      const res = await fetch(`${BACKEND_URL}/books?${params.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const normalized = json.data.map((b) => normalizeBackendBook(b));
          return normalized;
        }
      }
    } catch (backendErr) {
      // Backend not running or timeout; seamlessly continue to Google Books
    }

    // B) Fetch real books from Google Books API
    try {
      let searchParam = "bestsellers";
      if (query.trim()) {
        searchParam = query.trim();
      } else if (genre && genre !== "All") {
        searchParam = `subject:${genre}`;
      }

      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        searchParam
      )}&maxResults=16&printType=books`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Google Books request failed");

      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const formatted = data.items.map((item, idx) => formatGoogleBook(item, idx));
        googleBooksCache = formatted;
        return formatted;
      }
    } catch (err) {
      console.warn("Google Books API network fallback:", err.message);
    }

    // C) 700 Books Dataset Fallback (/data/books.json)
    try {
      const res = await fetch("/data/books.json");
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          let filtered = list;
          if (query.trim()) {
            const q = query.trim().toLowerCase();
            filtered = filtered.filter(
              (b) =>
                b.bookname.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q) ||
                b.isbn.includes(q) ||
                b.tags?.some((t) => t.toLowerCase().includes(q))
            );
          }
          if (genre && genre !== "All") {
            filtered = filtered.filter((b) => b.genre.toLowerCase() === genre.toLowerCase());
          }
          if (tag) {
            filtered = filtered.filter((b) => b.tags?.some((t) => t.toLowerCase().includes(tag.toLowerCase())));
          }
          if (filtered.length > 0) {
            const normalized = filtered.map((b) => normalizeBackendBook(b));
            googleBooksCache = normalized;
            return normalized;
          }
        }
      }
    } catch (e) {
      // Continue to static fallback
    }

    // D) In-Memory Cache or Static Fallback
    if (googleBooksCache.length > 0) {
      return googleBooksCache;
    }
    return FALLBACK_BOOKS;
  },

  // 2. Get single book by ID
  getBookById: async (id) => {
    // Try Express Backend if ID is numeric
    if (!isNaN(id) && Number(id) > 0) {
      try {
        const res = await fetch(`${BACKEND_URL}/books/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return normalizeBackendBook(json.data);
          }
        }
      } catch (e) {
        // Continue to cache/Google Books
      }
    }

    // Check local cache
    const cached = googleBooksCache.find((b) => String(b.id) === String(id));
    if (cached) return cached;

    const fallback = FALLBACK_BOOKS.find((b) => String(b.id) === String(id));
    if (fallback) return fallback;

    // Fetch directly from Google Books API by Volume ID
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      if (res.ok) {
        const item = await res.json();
        const book = formatGoogleBook(item, 0);
        googleBooksCache.push(book);
        return book;
      }
    } catch (e) {
      console.warn("Could not fetch volume by ID:", e.message);
    }

    return googleBooksCache[0] || FALLBACK_BOOKS[0];
  },

  // 3. PostgreSQL Database Loan Methods (Express Backend)
  borrowBookFromDB: async (bookId, userName = "Student Reader", userEmail = "student@university.edu", days = 14) => {
    const res = await fetch(`${BACKEND_URL}/borrow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId: parseInt(bookId, 10), userName, userEmail, days }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to borrow book from database");
    }
    return data;
  },

  returnBookToDB: async (borrowId) => {
    const res = await fetch(`${BACKEND_URL}/borrow/${borrowId}/return`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to return book to database");
    }
    return data;
  },

  getUserBorrowHistory: async (userEmail = "student@university.edu") => {
    try {
      const res = await fetch(`${BACKEND_URL}/borrow/user?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (res.ok && data.success) return data.data;
    } catch (err) {
      console.warn("Backend borrow history error:", err.message);
    }
    return [];
  },

  checkBackendHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${BACKEND_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return { online: true, ...data };
      }
    } catch (e) {
      // offline
    }
    return { online: false };
  },

  // 4. Digital Book Locking (24-hour hold in client state)
  lockBookDigitally: async (bookId, userName = "Maya Chen") => {
    const locks = JSON.parse(localStorage.getItem("y_library_locks") || "[]");
    const book = await api.getBookById(bookId);

    if (!book) throw new Error("Book not found");

    const existing = locks.find((l) => String(l.bookId) === String(bookId) && l.status === "Locked");
    if (existing) {
      throw new Error("You already hold an active lock on this book!");
    }

    const lockRecord = {
      id: Date.now(),
      bookId: book.id,
      title: book.title,
      author: book.author,
      location: book.location,
      lockedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      expiresIn: "23h 59m",
      status: "Locked",
      userName,
    };

    locks.unshift(lockRecord);
    localStorage.setItem("y_library_locks", JSON.stringify(locks));
    return lockRecord;
  },

  getActiveLocks: async () => {
    return JSON.parse(localStorage.getItem("y_library_locks") || "[]");
  },

  releaseLock: async (lockId) => {
    const locks = JSON.parse(localStorage.getItem("y_library_locks") || "[]");
    const lock = locks.find((l) => l.id === Number(lockId));
    if (lock) {
      lock.status = "Released";
      localStorage.setItem("y_library_locks", JSON.stringify(locks));
    }
  },

  // 5. Add peer review to book
  addReview: async (bookId, { user, rating, comment }) => {
    const book = await api.getBookById(bookId);
    if (!book) return null;

    if (!book.peerReviews) book.peerReviews = [];
    book.peerReviews.unshift({
      user: user || "Maya Chen",
      rating: Number(rating),
      comment,
      date: "Just now",
    });

    return book;
  },

  // 6. Free LLM Explainer for 5 y/o and 10 y/o
  getLLMSummary: async (book, ageLevel = "5") => {
    if (ageLevel === "5" && book.eli5Summary) return book.eli5Summary;
    if (ageLevel === "10" && book.eli10Summary) return book.eli10Summary;

    try {
      const prompt = `Give a very short 2-sentence summary of the book "${book.title}" by ${book.author} written for a ${ageLevel}-year-old kid. Make it fun, simple, and exciting.`;
      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      if (res.ok) {
        const text = await res.text();
        return text.trim();
      }
    } catch (e) {
      // offline fallback
    }

    return ageLevel === "5"
      ? `A wonderful story about ${book.title}! It is full of friendly adventures and teaches kids how to be brave and kind.`
      : `An exciting journey called ${book.title} where the characters face big challenges and discover how to solve mysterious problems.`;
  },

  // 7. Community Readers
  getCommunityPeople: async () => {
    return [
      {
        id: 1,
        name: "Maya Chen",
        major: "Architecture · Year 3",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
        match: "96%",
        sharedBooks: ["The Secret History", "Ways of Seeing"],
        recentReview: "East L3 study carrels are the best place to read Donna Tartt.",
      },
      {
        id: 2,
        name: "Idris Okafor",
        major: "Philosophy & CS · Year 2",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
        match: "91%",
        sharedBooks: ["Tomorrow, and Tomorrow, and Tomorrow", "Babel"],
        recentReview: "Game design + literature is the future of storytelling.",
      },
      {
        id: 3,
        name: "Sofia Reyes",
        major: "Comparative Lit · Year 4",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
        match: "88%",
        sharedBooks: ["Braiding Sweetgrass", "The Left Hand of Darkness"],
        recentReview: "Pachinko taught me more about resilience than any textbook.",
      },
    ];
  },

  // 8. Marketplace
  getMarketplaceListings: async () => {
    return JSON.parse(
      localStorage.getItem("y_library_market") ||
        JSON.stringify([
          {
            id: 1,
            title: "The Secret History (Signed 1st Edition)",
            author: "Donna Tartt",
            type: "Signed Copy",
            price: 65,
            condition: "Mint Condition with Dust Jacket",
            seller: "Sofia Reyes (Comp Lit '26)",
            sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
            coverImg: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=500&fit=crop",
            notes: "Signed at Harvard Bookstore. Verified campus authenticated.",
          },
          {
            id: 2,
            title: "Braiding Sweetgrass",
            author: "Robin Wall Kimmerer",
            type: "Barter / Trade",
            price: 0,
            tradeFor: "Will trade for any Ursula K. Le Guin or Octavia Butler",
            condition: "Gently Used, No Highlighting",
            seller: "Leo Hoffman (Env Sci '27)",
            sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            coverImg: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
            notes: "Can meet at Campus Center or Main Library lobby.",
          },
        ])
    );
  },

  createListing: async (listing) => {
    const market = await api.getMarketplaceListings();
    const newListing = {
      id: Date.now(),
      ...listing,
      seller: "Maya Chen (Arch '26)",
      sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    };
    market.unshift(newListing);
    localStorage.setItem("y_library_market", JSON.stringify(market));
    return newListing;
  },

  // 9. Book Requests
  getRequests: async () => {
    return JSON.parse(
      localStorage.getItem("y_library_requests") ||
        JSON.stringify([
          {
            id: 1,
            title: "Klara and the Sun",
            author: "Kazuo Ishiguro",
            requester: "Alex Rivera",
            department: "Philosophy & AI",
            reason: "Needed for Senior Thesis on artificial consciousness.",
            votes: 18,
            status: "In Acquisition",
          },
          {
            id: 2,
            title: "Architecture: Form, Space, & Order",
            author: "Francis D. K. Ching",
            requester: "Maya Chen",
            department: "Architecture",
            reason: "Essential studio reference, currently zero copies in East Library.",
            votes: 31,
            status: "Ordered (Arriving Friday)",
          },
        ])
    );
  },

  submitRequest: async ({ title, author, department, reason }) => {
    const reqs = await api.getRequests();
    const newReq = {
      id: Date.now(),
      title,
      author,
      requester: "Maya Chen",
      department: department || "General Studies",
      reason,
      votes: 1,
      status: "Submitted to Librarian",
    };
    reqs.unshift(newReq);
    localStorage.setItem("y_library_requests", JSON.stringify(reqs));
    return newReq;
  },

  upvoteRequest: async (requestId) => {
    const reqs = await api.getRequests();
    const req = reqs.find((r) => r.id === Number(requestId));
    if (req) {
      req.votes += 1;
      localStorage.setItem("y_library_requests", JSON.stringify(reqs));
    }
    return reqs;
  },

  // 10. Readlists
  getReadlists: async () => {
    return JSON.parse(
      localStorage.getItem("y_library_readlists") ||
        JSON.stringify([
          {
            id: 1,
            title: "Campus Favorites",
            description: "Books every university student should read before graduating.",
            bookIds: ["gbook_1", "gbook_2"],
          },
        ])
    );
  },

  createReadlist: async (title, description) => {
    const lists = await api.getReadlists();
    const newList = {
      id: Date.now(),
      title,
      description,
      bookIds: [],
    };
    lists.push(newList);
    localStorage.setItem("y_library_readlists", JSON.stringify(lists));
    return newList;
  },
};
