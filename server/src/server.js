// Entry point for Y-Library Server
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`📚 Y-Library Backend Server is Running!`);
  console.log(`🚀 Port: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📖 Books Endpoint: http://localhost:${PORT}/api/books`);
  console.log(`🏷️  Borrow Endpoint: http://localhost:${PORT}/api/borrow`);
  console.log(`===============================================`);
});
