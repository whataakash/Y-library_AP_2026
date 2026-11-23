import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FloatingDock from "./components/FloatingDock";
import AIChatbot from "./components/Chatbot/AIChatbot";
import ChatTriggerButton from "./components/Chatbot/ChatTriggerButton";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Modular handler: accepts either a book object OR a book ID
  // When a book tile is clicked, the full book object is passed directly via props
  const handleSelectBook = (bookOrId) => {
    if (typeof bookOrId === "object" && bookOrId !== null) {
      setSelectedBook(bookOrId);
      setSelectedBookId(bookOrId.id || bookOrId.isbn);
    } else {
      setSelectedBookId(bookOrId);
      setSelectedBook(null);
    }
    setActiveTab("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = () => {
    setActiveTab("books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setActiveTab("books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="steam-app-layout">
          {/* Left Steam Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
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
              setActiveTab={setActiveTab}
              activeCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onOpenChatbot={() => setIsChatbotOpen(true)}
            />

            {/* Dynamic Content Views */}
            <main className="steam-content-scroll">
              {activeTab === "home" && (
                <Home
                  onSelectBook={handleSelectBook}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "books" && (
                <Books
                  onSelectBook={handleSelectBook}
                  initialSearch={searchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {activeTab === "details" && (
                <BookDetails
                  book={selectedBook}
                  bookId={selectedBookId}
                  onBack={() => setActiveTab("books")}
                />
              )}

              {activeTab === "library" && (
                <Dashboard
                  onSelectBook={handleSelectBook}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "community" && (
                <Community onSelectBook={handleSelectBook} />
              )}

              {activeTab === "marketplace" && <Marketplace />}

              {activeTab === "requests" && <Requests />}
            </main>
          </div>

          {/* Bottom Floating Navigation Dock */}
          <FloatingDock
            activeTab={activeTab}
            setActiveTab={setActiveTab}
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
      </AuthProvider>
    </ThemeProvider>
  );
}
