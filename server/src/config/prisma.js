// Database Client Configuration
// We use Prisma Client to interact with our PostgreSQL database easily

const { PrismaClient } = require("@prisma/client");

// Create a single instance of PrismaClient to share across the application
const prisma = new PrismaClient({
  log: ["warn", "error"],
});

module.exports = prisma;
