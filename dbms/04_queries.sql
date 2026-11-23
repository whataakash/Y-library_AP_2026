-- =============================================================================
-- Y-Library Application SQL Workload (04_queries.sql)
-- DBMS Project - Applied Programming (AP) Repository
-- Table schema: users, books, borrow_records
-- All queries use JOINs where appropriate and are marked as -- READ or -- WRITE.
-- =============================================================================

-- R1: Student sign-in and profile lookup by unique email
-- READ
SELECT id, email, name, password, major, year, preferred_genres, reading_goal
FROM users
WHERE email = 'alex.morgan@y-university.edu';

-- R2: Catalog search by title or author with rating sort
-- READ
SELECT id, bookname, author, isbn, genre, available_count, location, rating
FROM books
WHERE bookname ILIKE '%Money%' OR author ILIKE '%Housel%'
ORDER BY rating DESC;

-- R3: Multi-tag search using PostgreSQL GIN array operator
-- READ
SELECT id, bookname, author, genre, tags, available_count, location
FROM books
WHERE tags @> ARRAY['economics']
ORDER BY rating DESC
LIMIT 20;

-- R4: Student active loans and borrow history joined with book metadata
-- READ
SELECT b.id AS record_id, k.bookname, k.author, k.location, k.isbn,
       b.borrow_date, b.due_date, b.status
FROM borrow_records b
JOIN books k ON k.id = b.book_id
WHERE b.user_email = 'alex.morgan@y-university.edu'
ORDER BY b.borrow_date DESC;

-- R5: Admin overdue audit dashboard joining loans, books, and student accounts
-- READ
SELECT b.id AS loan_id, k.bookname, k.isbn, b.user_name, b.user_email,
       b.borrow_date, b.due_date,
       ROUND(EXTRACT(EPOCH FROM (NOW() - b.due_date)) / 86400, 1) AS days_overdue
FROM borrow_records b
JOIN books k ON k.id = b.book_id
LEFT JOIN users u ON u.id = b.user_id
WHERE b.status = 'BORROWED' AND b.due_date < NOW()
ORDER BY b.due_date ASC;

-- R6: Catalog genre inventory roll-up and average rating analytics
-- READ
SELECT genre,
       COUNT(*) AS total_titles,
       SUM(total_count) AS total_copies,
       SUM(available_count) AS available_copies,
       ROUND(AVG(rating), 2) AS avg_rating
FROM books
GROUP BY genre
ORDER BY total_copies DESC;

-- R7: Personalized book recommendations matching student's preferred genres
-- READ
SELECT b.id, b.bookname, b.author, b.genre, b.rating, b.available_count
FROM books b
JOIN users u ON u.email = 'alex.morgan@y-university.edu'
WHERE b.genre = ANY(u.preferred_genres) AND b.available_count > 0
ORDER BY b.rating DESC
LIMIT 10;

-- R8: Student reading engagement summary joining users and historical borrow records
-- READ
SELECT u.id, u.name, u.email, u.major,
       COUNT(b.id) AS total_borrowed,
       COUNT(b.id) FILTER (WHERE b.status = 'BORROWED') AS active_loans,
       COUNT(b.id) FILTER (WHERE b.status = 'RETURNED') AS returned_books
FROM users u
LEFT JOIN borrow_records b ON b.user_id = u.id
WHERE u.id = 1
GROUP BY u.id, u.name, u.email, u.major;

-- W1: Student account registration
-- WRITE
INSERT INTO users (name, email, password, major, year, preferred_genres)
VALUES ('Karan Sharma', 'karan.sharma@y-university.edu', '$2a$10$e8w.K2hFq', 'Computer Science & AI', 'Year 1', ARRAY['Technology', 'Economics']);

-- W2: Add new book acquisition to catalog
-- WRITE
INSERT INTO books (bookname, book_image, isbn, total_count, available_count, edition, rating, location, author, genre, tags)
VALUES ('Designing Data-Intensive Applications', 'https://covers.openlibrary.org/b/id/8231996-L.jpg', '9781449373320', 3, 3, '1st Edition', 4.9, 'Central Library / C-04', 'Martin Kleppmann', 'Technology', ARRAY['technology', 'database', 'distributed systems', 'scalability']);

-- W3: Checkout transaction: create borrow record and decrement available count
-- WRITE
INSERT INTO borrow_records (book_id, user_id, user_name, user_email, due_date, status)
SELECT 1, id, name, email, NOW() + INTERVAL '14 days', 'BORROWED'
FROM users WHERE email = 'alex.morgan@y-university.edu';
UPDATE books SET available_count = available_count - 1 WHERE id = 1 AND available_count > 0;

-- W4: Return transaction: close borrow record and increment available count
-- WRITE
UPDATE borrow_records SET return_date = NOW(), status = 'RETURNED'
WHERE id = (SELECT id FROM borrow_records WHERE status = 'BORROWED' ORDER BY borrow_date ASC LIMIT 1);
UPDATE books SET available_count = available_count + 1
WHERE id = (SELECT book_id FROM borrow_records WHERE status = 'RETURNED' ORDER BY return_date DESC LIMIT 1);

-- W5: Update user reading goal progress and favorite books
-- WRITE
UPDATE users
SET reading_goal = jsonb_set(reading_goal, '{completed}', '9'::jsonb),
    favorites = array_append(favorites, '9781449373320')
WHERE id = 1;
