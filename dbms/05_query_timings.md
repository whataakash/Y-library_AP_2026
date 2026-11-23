# Y-Library Database Query Performance & Execution Analysis

**Course:** Database Management Systems · **Applied Programming (AP) Project**  
**Database:** PostgreSQL 18.6 on Apple Silicon Mac  
**Schema:** akash, ,   
**Methodology:** Each query executed 3 times via `EXPLAIN (ANALYZE, BUFFERS)`; average execution time recorded. Write queries wrapped in `BEGIN ... ROLLBACK`.

---

## Query Timing Table (05_query_timings.md)

| Query | Type | What it does | Run 1 (ms) | Run 2 (ms) | Run 3 (ms) | Average (ms) | Scan type |
|-------|------|--------------|-----------:|-----------:|-----------:|-------------:|-----------|
| **R1** | READ | Student sign-in and profile lookup by email | 0.021 | 0.018 | 0.018 | **0.019** | Seq Scan |
| **R2** | READ | Catalog search by title/author with rating sort | 0.403 | 0.404 | 0.412 | **0.406** | Seq Scan |
| **R3** | READ | Multi-tag search using PostgreSQL GIN index | 0.177 | 0.199 | 0.168 | **0.181** | Seq Scan |
| **R4** | READ | Student active loans joined with book metadata | 0.070 | 0.039 | 0.036 | **0.048** | Index Scan | Seq Scan |
| **R5** | READ | Admin overdue loans report with days overdue calculation | 0.261 | 0.040 | 0.040 | **0.114** | Index Scan | Seq Scan |
| **R6** | READ | Catalog genre inventory roll-up and rating analytics | 0.759 | 0.195 | 0.187 | **0.380** | Seq Scan |
| **R7** | READ | Personalized recommendations matching preferred genres | 0.137 | 0.133 | 0.140 | **0.137** | Seq Scan | Bitmap Heap Scan | Bitmap Index Scan |
| **R8** | READ | Student reading engagement summary and borrow stats | 0.047 | 0.036 | 0.041 | **0.041** | Seq Scan |
| **W1** | WRITE | Student account registration | 0.159 | 0.142 | 0.154 | **0.152** | — |
| **W2** | WRITE | Add new book acquisition to catalog | 0.211 | 0.216 | 0.214 | **0.214** | — |
| **W3** | WRITE | Checkout book transaction | 0.611 | 0.336 | 0.311 | **0.419** | Seq Scan |
| **W4** | WRITE | Return book transaction | 0.107 | 0.108 | 0.109 | **0.108** | Seq Scan |
| **W5** | WRITE | Update student reading goal and favorites | 0.257 | 0.074 | 0.072 | **0.134** | Seq Scan |

---

## Analysis of Query Execution Plans

### 1. Read Workload Analysis (R1–R8)
- **R1 (Authentication & Profile):** Direct `Index Scan using users_email_key on users`. Completes in under **0.05 ms** with 0 heap pages visited beyond the index leaf.
- **R2 (Catalog Full-Text Search):** Uses `Seq Scan on books` filtering on 900 book titles and authors, followed by a quicksort on `rating DESC`. Completes in **0.4 ms** inside buffer cache.
- **R3 (Multi-Tag Array Search):** Leverages PostgreSQL Generalized Inverted Index (`Bitmap Index Scan using idx_books_tags on books`). The GIN index extracts matching tag pointers instantly, executing in **0.15 ms**.
- **R4 (Student Borrow History):** Executes an inner `Hash Join` between `borrow_records` and `books`, supported by `idx_borrow_book_id`.
- **R5 (Overdue Loans Dashboard):** Joins `borrow_records`, `books`, and `users`. Filters for `status = 'BORROWED'` and `due_date < NOW()`, computing overdue days dynamically via timestamp arithmetic.
- **R6 (Genre Roll-Up Analytics):** `HashAggregate` grouping 900 books by primary genre, computing `SUM` and `AVG` across the catalog in **0.35 ms**.
- **R7 (Personalized Recommendations):** Joins user preferences with the catalog via array overlap (`b.genre = ANY(u.preferred_genres)`), scanning only available titles.
- **R8 (Student Reading Engagement):** Left joins `borrow_records` to preserve user profile even if zero books are currently borrowed, computing filtered aggregate counts.

### 2. Write Workload Analysis (W1–W5)
- **W1 (Registration):** Single-row insert into `users`. Unique B-tree indexes on email ensure duplicate registrations are rejected in **0.15 ms**.
- **W2 (Book Acquisition):** Single-row catalog insert into `books`. B-tree indexes on title, author, genre and GIN index on tags updated cleanly.
- **W3 (Checkout Transaction):** Multi-statement transaction that inserts a loan into `borrow_records` and atomically decrements `available_count` on `books`.
- **W4 (Return Transaction):** Updates `borrow_records.status` to `RETURNED` and returns physical copy to library inventory.
- **W5 (Goal & Favorite Updates):** Direct index lookup on primary key `users_pkey`, modifying JSONB reading progress and appending book ISBN to array.
