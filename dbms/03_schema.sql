-- PostgreSQL Production Schema for Y-Library (Campus Library Management System)
-- Relational DDL Script for Faculty Review and Evaluation
-- Runs on PostgreSQL 13 or newer.
-- Re-runnable / Idempotent: Safely drops tables in reverse dependency order and recreates them.

DROP TABLE IF EXISTS borrow_records CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE
-- Multi-user authentication & personalization profiles (Local bcrypt + Google OAuth)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id                SERIAL PRIMARY KEY,
    email             VARCHAR(255) NOT NULL UNIQUE,
    name              VARCHAR(255) NOT NULL,
    password          VARCHAR(255),                              -- Nullable for Google OAuth accounts
    google_id         VARCHAR(255) UNIQUE,                       -- Nullable for local email/password accounts
    avatar            TEXT,
    major             VARCHAR(150) NOT NULL DEFAULT 'Computer Science & AI',
    year              VARCHAR(50)  NOT NULL DEFAULT 'Year 1',
    preferred_genres  TEXT[]       NOT NULL DEFAULT '{}',        -- Native PostgreSQL array for genre recommendations
    interests         TEXT[]       NOT NULL DEFAULT '{}',        -- Keyword tags matching student interests
    read_books        TEXT[]       NOT NULL DEFAULT '{}',        -- Historical book identifiers read by student
    favorites         TEXT[]       NOT NULL DEFAULT '{}',        -- Student favorite book identifiers
    continue_reading  JSONB        DEFAULT '[]'::jsonb,          -- Book progress and bookmark state
    reading_goal      JSONB        DEFAULT '{"target":10,"completed":0,"streakDays":1}'::jsonb,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. BOOKS TABLE
-- Campus physical book catalog with multi-tag array and shelf locations
-- -----------------------------------------------------------------------------
CREATE TABLE books (
    id                SERIAL PRIMARY KEY,
    bookname          VARCHAR(255) NOT NULL,
    book_image        TEXT         NOT NULL,                     -- Verified OpenLibrary / Google Books cover URL
    isbn              VARCHAR(50)  NOT NULL UNIQUE,              -- Unique International Standard Book Number
    total_count       INTEGER      NOT NULL DEFAULT 1 CHECK (total_count >= 0),
    available_count   INTEGER      NOT NULL DEFAULT 1 CHECK (available_count >= 0),
    edition           VARCHAR(50)  DEFAULT '1st Edition',
    rating            NUMERIC(2, 1) DEFAULT 4.5 CHECK (rating >= 0.0 AND rating <= 5.0),
    location          VARCHAR(150) NOT NULL,                     -- Physical shelf/rack (e.g. 'Central Library / A-01')
    author            VARCHAR(255) NOT NULL,
    genre             VARCHAR(100) NOT NULL,                     -- Primary subject category
    tags              TEXT[]       NOT NULL DEFAULT '{}',        -- Native PostgreSQL tags for GIN index search
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. BORROW_RECORDS TABLE
-- Tracks book checkouts, deadlines, return timestamps, and point-in-time student audits
-- -----------------------------------------------------------------------------
CREATE TABLE borrow_records (
    id                SERIAL PRIMARY KEY,
    book_id           INTEGER      NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    user_id           INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    user_name         VARCHAR(150) NOT NULL,                     -- Immutable student name snapshot for library audit
    user_email        VARCHAR(150) NOT NULL,                     -- Immutable email snapshot for library audit
    borrow_date       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date          TIMESTAMP WITH TIME ZONE NOT NULL,         -- Default 14-day checkout loan window
    return_date       TIMESTAMP WITH TIME ZONE,                  -- NULL while active, populated upon physical return
    status            VARCHAR(20)  DEFAULT 'BORROWED' CHECK (status IN ('BORROWED', 'RETURNED')),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 4. PERFORMANCE & SEARCH INDEXES
-- -----------------------------------------------------------------------------

-- Fast lookups by title, author, and primary genre
CREATE INDEX idx_books_bookname ON books(bookname);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_genre ON books(genre);

-- GIN (Generalized Inverted Index) for instant multi-tag searching: tags @> ARRAY['money']
CREATE INDEX idx_books_tags ON books USING GIN(tags);

-- User email lookup index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_preferred_genres ON users USING GIN(preferred_genres);

-- Foreign key indexes for borrow joins and status filters
CREATE INDEX idx_borrow_book_id ON borrow_records(book_id);
CREATE INDEX idx_borrow_user_id ON borrow_records(user_id);
CREATE INDEX idx_borrow_status ON borrow_records(status);
