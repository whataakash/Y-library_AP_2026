import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
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

  const handleSelectBook = (id) => {
    setSelectedBookId(id);
    setActiveTab("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchSubmit = () => {
    setActiveTab("books");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
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
      </div>
    </AuthProvider>
  );
}
