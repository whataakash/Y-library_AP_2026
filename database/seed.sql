-- Sample Seed Data for Y-Library (DML)
-- Generated following the Open Library Dataset Rules:
-- 1. Regex Genre Inference
-- 2. Multi-tag Array formatting
-- 3. Shelf mapping (Central Library / Floor ...)
-- 4. Edition count and First Publish Year indexing

INSERT INTO books (bookname, book_image, isbn, total_count, available_count, edition, rating, location, author, genre, tags)
VALUES
(
    'Clean Code: A Handbook of Agile Software Craftsmanship',
    'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
    '9780132350884',
    5,
    4,
    '2008 first published; 6 edition(s) indexed',
    4.70,
    'Central Library / Floor 2 - Section C (Science & Tech)',
    'Robert C. Martin',
    'Technology & Computer Science',
    ARRAY['computer-science', 'programming', 'software-engineering', 'agile', 'technology']
),
(
    'Dune',
    'https://covers.openlibrary.org/b/id/12838383-L.jpg',
    '9780441172719',
    8,
    6,
    '1965 first published; 42 edition(s) indexed',
    4.80,
    'Central Library / Floor 1 - Section B (Fiction & Mystery)',
    'Frank Herbert',
    'Science Fiction',
    ARRAY['science-fiction', 'space', 'desert-planet', 'classic', 'dystopia']
),
(
    'The Hobbit',
    'https://covers.openlibrary.org/b/id/12083547-L.jpg',
    '9780547928227',
    6,
    5,
    '1937 first published; 75 edition(s) indexed',
    4.90,
    'Central Library / Floor 1 - Section A (General & Classics)',
    'J.R.R. Tolkien',
    'Fantasy',
    ARRAY['fantasy', 'magic', 'dragons', 'myth', 'middle-earth']
),
(
    'Thinking, Fast and Slow',
    'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
    '9780374533557',
    4,
    3,
    '2011 first published; 18 edition(s) indexed',
    4.60,
    'Central Library / Floor 2 - Section D (Philosophy & Psychology)',
    'Daniel Kahneman',
    'Psychology',
    ARRAY['psychology', 'cognition', 'decision-making', 'behavioral-economics']
),
(
    'The Republic',
    'https://covers.openlibrary.org/b/id/8231996-L.jpg',
    '9780140455113',
    4,
    2,
    '375 BC first published; 120 edition(s) indexed',
    4.50,
    'Central Library / Floor 2 - Section D (Philosophy & Psychology)',
    'Plato',
    'Philosophy',
    ARRAY['philosophy', 'ethics', 'justice', 'political-theory', 'classics']
),
(
    'The Psychology of Money',
    'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
    '9780857197689',
    7,
    5,
    '2020 first published; 8 edition(s) indexed',
    4.75,
    'Central Library / Floor 3 - Section E (Economics & Business)',
    'Morgan Housel',
    'Economics & Finance',
    ARRAY['economics', 'finance', 'money', 'investing', 'psychology']
),
(
    'The Left Hand of Darkness',
    'https://covers.openlibrary.org/b/isbn/9780441478125-L.jpg',
    '9780441478125',
    3,
    1,
    '1969 first published; 31 edition(s) indexed',
    4.65,
    'Central Library / Floor 1 - Section B (Fiction & Mystery)',
    'Ursula K. Le Guin',
    'Science Fiction',
    ARRAY['science-fiction', 'space', 'winter-planet', 'philosophy', 'classic']
),
(
    'Death''s End (The Three-Body Problem Series Book 3)',
    'https://covers.openlibrary.org/b/id/7893958-L.jpg',
    '9780765377104',
    9,
    7,
    '2010 first published; 27 edition(s) indexed',
    4.35,
    'Central Library / Floor 2 - Section C (Science & Tech)',
    'Liu Cixin',
    'Science Fiction',
    ARRAY['science-fiction', 'alien-contact', 'hard-scifi', 'space', 'cosmology']
)
ON CONFLICT (isbn) DO NOTHING;
