import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FloatingDock from "./components/FloatingDock";
import AIChatbot from "./components/Chatbot/AIChatbot";
import ChatTriggerButton from "./components/Chatbot/ChatTriggerButton";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";
import AdminPortal from "./pages/AdminPortal";

// Wrapper component to pass URL param :id directly to BookDetails
function BookDetailsWrapper({ selectedBook, onBack }) {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <BookDetails
      book={selectedBook}
      bookId={id}
      onBack={onBack || (() => navigate("/books"))}
    />
  );
}

function MainLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Active tab inferred from current pathname (e.g. /home -> "home")
  const activeTab = location.pathname.replace(/^\//, "") || "home";

  // Select book: navigates to /books/:id
  const handleSelectBook = (bookOrId) => {
    let bookId = bookOrId;
    if (typeof bookOrId === "object" && bookOrId !== null) {
      setSelectedBook(bookOrId);
      bookId = bookOrId.id || bookOrId.isbn;
    } else {
      setSelectedBook(null);
    }
    navigate(`/books/${bookId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = () => {
    navigate("/books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    navigate("/books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If not logged in: only "/" and "/login" render LandingPage
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LandingPage defaultOpenAuth={true} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Once authenticated: render the full application layout with route-based views
  return (
    <div className="steam-app-layout">
      {/* Left Steam Sidebar with real URL links */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => navigate("/" + tab)}
        onSelectBook={handleSelectBook}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Right Main Area */}
      <div className="steam-main-area">
        {/* Topbar Header */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          setActiveTab={(tab) => navigate("/" + tab)}
          activeCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenChatbot={() => setIsChatbotOpen(true)}
        />

        {/* Dynamic Route-Driven Content Scroll */}
        <main className="steam-content-scroll">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Navigate to="/home" replace />} />

            <Route
              path="/home"
              element={
                <Home
                  onSelectBook={handleSelectBook}
                  setActiveTab={(tab) => navigate("/" + tab)}
                />
              }
            />

            <Route
              path="/books"
              element={
                <Books
                  onSelectBook={handleSelectBook}
                  initialSearch={searchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              }
            />

            <Route
              path="/books/:id"
              element={
                <BookDetailsWrapper
                  selectedBook={selectedBook}
                  onBack={() => navigate("/books")}
                />
              }
            />

            <Route
              path="/book/:id"
              element={
                <BookDetailsWrapper
                  selectedBook={selectedBook}
                  onBack={() => navigate("/books")}
                />
              }
            />

            <Route
              path="/library"
              element={
                <Dashboard
                  onSelectBook={handleSelectBook}
                  setActiveTab={(tab) => navigate("/" + tab)}
                />
              }
            />

            <Route path="/dashboard" element={<Navigate to="/library" replace />} />

            <Route
              path="/community"
              element={<Community onSelectBook={handleSelectBook} />}
            />

            <Route path="/marketplace" element={<Marketplace />} />

            <Route path="/requests" element={<Requests />} />

            {/* Admin & Librarian Portal */}
            <Route path="/admin" element={<AdminPortal />} />

            {/* Catch-all redirect to /home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>

      {/* Bottom Floating Navigation Dock */}
      <FloatingDock
        activeTab={activeTab}
        setActiveTab={(tab) => navigate("/" + tab)}
        onOpenChatbot={() => setIsChatbotOpen((prev) => !prev)}
      />

      {/* Floating AI Chatbot Action Button & Window */}
      <ChatTriggerButton
        isOpen={isChatbotOpen}
        onClick={() => setIsChatbotOpen((prev) => !prev)}
      />
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
