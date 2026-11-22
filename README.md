# 📚 Y-Library (Campus Library Management System)

A campus library web application built with a **React.js** frontend, an **Express.js** backend, **Prisma ORM**, and a **PostgreSQL** relational database.

---

## 🏗️ Architecture Overview

```
 ┌──────────────────────┐
 │   React 18 Frontend  │  (Port 5173 - Steam-Inspired Dark & Orange UI)
 └──────────┬───────────┘
            │  REST API Calls (fetch)
            ▼
 ┌──────────────────────┐
 │   Express.js Server  │  (Port 5001 - Modular MVC Architecture)
 └──────────┬───────────┘
            │  Prisma Client Queries
            ▼
 ┌──────────────────────┐
 │   Prisma ORM Layer   │  (Schema modeling & Database Migrations)
 └──────────┬───────────┘
            │  SQL / TCP Connection
            ▼
 ┌──────────────────────┐
 │  PostgreSQL Database │  (Port 5432 - Tables: books, borrow_records)
 └──────────────────────┘
```

---

## 📋 Database Schema Design (PostgreSQL + Prisma)

The database schema strictly adheres to the requested university specifications:

### 1. `books` Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Auto-incrementing unique identifier |
| `bookname` | `VARCHAR(255) NOT NULL` | Name / Title of the book |
| `bookImage` | `TEXT NOT NULL` | Google Books API image / cover URL |
| `isbn` | `VARCHAR(32) UNIQUE NOT NULL` | Unique ISBN-10 or ISBN-13 |
| `totalCount` | `INTEGER DEFAULT 1` | Total physical copies owned by the campus library |
| `availableCount` | `INTEGER DEFAULT 1` | Physical copies currently available on the shelf |
| `edition` | `VARCHAR(50) DEFAULT '1st Edition'` | Edition of the book |
| `rating` | `NUMERIC(3,2) DEFAULT 4.5` | Student / peer rating out of 5.0 |
| `location` | `VARCHAR(255) NOT NULL` | Physical shelf or rack location (e.g., *East Library · Level 3, Shelf B-14*) |
| `author` | `VARCHAR(255) NOT NULL` | Author name(s) |
| `genre` | `VARCHAR(100) NOT NULL` | Primary genre (Fiction, Science, Art, Philosophy, etc.) |
| `tags` | `TEXT[]` | PostgreSQL array of tags (e.g. `['fiction', 'money', 'scifi', 'novel']`) |
| `createdAt` | `TIMESTAMP DEFAULT NOW()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMP DEFAULT NOW()` | Record last update timestamp |

### 2. `borrow_records` Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `SERIAL PRIMARY KEY` | Unique borrow transaction ID |
| `bookId` | `INTEGER REFERENCES books(id)` | Foreign key referencing the borrowed book |
| `userName` | `VARCHAR(255) NOT NULL` | Student name |
| `userEmail` | `VARCHAR(255) NOT NULL` | University email |
| `borrowDate` | `TIMESTAMP DEFAULT NOW()` | Timestamp when the book was checked out |
| `dueDate` | `TIMESTAMP NOT NULL` | 14-day loan return deadline |
| `returnDate` | `TIMESTAMP NULL` | Timestamp when returned (`NULL` while active) |
| `status` | `VARCHAR(50) DEFAULT 'BORROWED'` | `'BORROWED'` or `'RETURNED'` |

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running on port 5432

### Step 1: Start PostgreSQL & Setup Database
1. Create database:
   ```bash
   createdb ylibrary
   ```
2. Navigate to the server folder:
   ```bash
   cd server
   ```
3. Sync schema using Prisma:
   ```bash
   npx prisma db push
   ```
4. Seed initial book catalog with tags and Google Books covers:
   ```bash
   npm run seed
   ```
*(Alternative: You can directly execute raw SQL files located in `database/schema.sql` and `database/seed.sql` using `psql -d ylibrary -f database/schema.sql`).*

### Step 2: Start Express.js Backend Server
Inside `server/`:
```bash
npm start
```
The server will run on: **`http://localhost:5001`**
- Health Check: `http://localhost:5001/api/health`
- Books API: `http://localhost:5001/api/books`
- Borrow API: `http://localhost:5001/api/borrow`

### Step 3: Start React.js Frontend
In a new terminal window:
```bash
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎓 Faculty Explanation Guide (How to Explain Your Code)

When presenting to your professors or evaluators, explain the project using these points:

### 1. Beginner-Friendly MVC Architecture
- **Routes (`src/routes/`)**: Map clean REST endpoints (`/api/books`, `/api/borrow`) to controller methods.
- **Controllers (`src/controllers/`)**: House business logic in plain, easy-to-read JavaScript functions.
- **Config / Models (`src/config/prisma.js` & `prisma/schema.prisma`)**: Prisma acts as the Object-Relational Mapper (ORM), abstracting raw SQL while maintaining database constraints and relationships.

### 2. Multi-Tag Searching in PostgreSQL
- Unlike simple comma-separated strings, tags are stored as a native **PostgreSQL Array (`TEXT[]`)**.
- In Prisma, we query this using `tags: { has: query.toLowerCase() }`, which compiles down to PostgreSQL's array operator (`@>`). This allows filtering books with tags like `fiction`, `money`, `scifi`, and `novel`.

### 3. ACID Transactions for Borrowing
- When a student borrows a book, two operations must succeed together:
  1. Create a `BorrowRecord` entry.
  2. Decrement `availableCount` on the `Book` record by 1.
- In `borrow.controller.js`, we use `prisma.$transaction([ ... ])`. If any step fails (e.g., zero copies left), the entire operation rolls back automatically to protect data consistency.

### 4. Resilient Frontend Integration & Fallback
- The React client in `client/src/services/api.js` queries our Express backend (`http://localhost:5001/api`).
- If the backend is running, it renders live PostgreSQL data with full CRUD and borrowing support.
- If the local database is ever offline during a quick presentation, it automatically falls back to the live Google Books API, ensuring the demo never breaks.
