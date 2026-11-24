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

-- -----------------------------------------------------------------------------
-- 5. SEED DEMO USERS (2 Admins, 2 Librarians, 5 Students)
-- Password hashes encrypted using industry-standard bcrypt (cost factor 10)
-- Credentials:
--   Admins (2):     'AdminPassword123!'
--   Librarians (2): 'LibrarianPass123!'
--   Students (5):   'StudentPass123!'
-- -----------------------------------------------------------------------------
INSERT INTO users (name, email, password, major, year, preferred_genres, interests)
VALUES
  ('Dr. Arthur Vance', 'arthur.vance@y-university.edu', '$2b$10$q0Suem1oyXX0FbORnCTlSuceArCv1xD0w.qtW5PiJZJRR/Ed4ISUO', 'Campus Dean of Academic Affairs & Systems', 'Administration Staff', ARRAY['Technology', 'Economics', 'Philosophy', 'History'], ARRAY['governance', 'policy']),
  ('Elena Rostova', 'elena.rostova@y-university.edu', '$2b$10$q0Suem1oyXX0FbORnCTlSuceArCv1xD0w.qtW5PiJZJRR/Ed4ISUO', 'Director of Library Information Systems', 'System Operations', ARRAY['Technology', 'Science', 'Business', 'Mathematics'], ARRAY['database systems', 'security']),
  ('Margaret Hollowell', 'margaret.hollowell@y-university.edu', '$2b$10$iPsa/fDH.DTSYzbV67fBUepxRnducB5603Lawf7t.94d8zqr4WT4a', 'Head of Collections & Rare Manuscripts', 'Senior Cataloger', ARRAY['History', 'Classics', 'Philosophy'], ARRAY['preservation', 'manuscripts']),
  ('Samuel Thorne', 'samuel.thorne@y-university.edu', '$2b$10$iPsa/fDH.DTSYzbV67fBUepxRnducB5603Lawf7t.94d8zqr4WT4a', 'Research & Circulation Librarian', 'Circulation Desk Lead', ARRAY['Science Fiction', 'Science', 'Technology'], ARRAY['research', 'archives']),
  ('Alex Morgan', 'alex.morgan@y-university.edu', '$2b$10$VnS3JpwtMXaOpmywHefbEOVdvTowjfBDZqSlLTQ/XTgWE8LU.oHb.', 'Computer Science & AI', 'Senior (Year 4)', ARRAY['Technology', 'Science Fiction', 'Mathematics'], ARRAY['ai', 'algorithms']),
  ('Maya Chen', 'maya.chen@y-university.edu', '$2b$10$VnS3JpwtMXaOpmywHefbEOVdvTowjfBDZqSlLTQ/XTgWE8LU.oHb.', 'Architecture & Urban Design', 'Junior (Year 3)', ARRAY['History', 'Philosophy', 'Classics'], ARRAY['architecture', 'design']),
  ('Jordan Lee', 'jordan.lee@y-university.edu', '$2b$10$VnS3JpwtMXaOpmywHefbEOVdvTowjfBDZqSlLTQ/XTgWE8LU.oHb.', 'Economics & Financial Markets', 'Sophomore (Year 2)', ARRAY['Economics', 'Business', 'Psychology'], ARRAY['macroeconomics', 'finance']),
  ('Priya Sharma', 'priya.sharma@y-university.edu', '$2b$10$VnS3JpwtMXaOpmywHefbEOVdvTowjfBDZqSlLTQ/XTgWE8LU.oHb.', 'Data Science & Computational Linguistics', 'Freshman (Year 1)', ARRAY['Technology', 'Science', 'Philosophy'], ARRAY['nlp', 'robotics']),
  ('Marcus Aurelius Davies', 'marcus.davies@y-university.edu', '$2b$10$VnS3JpwtMXaOpmywHefbEOVdvTowjfBDZqSlLTQ/XTgWE8LU.oHb.', 'Classical Literature & Moral Philosophy', 'Senior (Year 4)', ARRAY['Philosophy', 'Classics', 'History'], ARRAY['stoicism', 'ethics'])
ON CONFLICT (email) DO NOTHING;
