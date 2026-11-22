import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import FloatingDock from "./components/FloatingDock";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedBookId, setSelectedBookId] = useState("gbook_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSelectBook = (id) => {
    setSelectedBookId(id);
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
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
                  bookId={selectedBookId}
                  onBack={() => setActiveTab("home")}
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
          <FloatingDock activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
