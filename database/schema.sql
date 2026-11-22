-- PostgreSQL Schema for Y-Library Management System
-- Faculty Presentation Script (DDL)

-- Drop tables if they already exist (in reverse order of foreign key dependencies)
DROP TABLE IF EXISTS borrow_records CASCADE;
DROP TABLE IF EXISTS books CASCADE;

-- 1. Create the 'books' table
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    bookname VARCHAR(255) NOT NULL,
    book_image TEXT NOT NULL,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    total_count INTEGER NOT NULL DEFAULT 1 CHECK (total_count >= 0),
    available_count INTEGER NOT NULL DEFAULT 1 CHECK (available_count >= 0),
    edition VARCHAR(50) DEFAULT '1st Edition',
    rating NUMERIC(2, 1) DEFAULT 4.5,
    location VARCHAR(150) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the 'borrow_records' table (tracks borrowing history)
CREATE TABLE borrow_records (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_name VARCHAR(150) NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'BORROWED' CHECK (status IN ('BORROWED', 'RETURNED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes for fast searching by faculty requirement (searching by title, author, and tags)
CREATE INDEX idx_books_bookname ON books(bookname);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_tags ON books USING GIN(tags);
