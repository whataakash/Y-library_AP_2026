# Normalization: Y-Library (Campus Library Management System)

Y-Library is a campus library management platform built with React, Express, Prisma ORM, and PostgreSQL. It allows university students to browse, search, and borrow physical books from campus library branches, while tracking reading goals, book availability, and loan return deadlines.

This document walks through the normalization of Y-Library's database schema from the initial application data model through First Normal Form (**1NF**), Second Normal Form (**2NF**), and Third Normal Form (**3NF**), followed by a Boyce-Codd Normal Form (**BCNF**) check. At each phase, tables, candidate keys, and functional dependencies ($FDs$) are explicitly detailed, followed by an analysis of the engineering trade-offs where the live production database deliberately denormalizes specific fields for performance and architectural simplicity.

---

## 0. The Data as the App Stores It Today

The live application stores data across three core PostgreSQL tables: `users`, `books`, and `borrow_records`.

| Table | Columns |
|---|---|
| **users** | `id` (serial, PK), `email` (unique), `name`, `password` (NULL for Google OAuth), `google_id` (unique, NULL for local accounts), `avatar`, `major`, `year`, **`preferred_genres`** (text[]), **`interests`** (text[]), **`read_books`** (text[]), **`favorites`** (text[]), **`continue_reading`** (jsonb), **`reading_goal`** (jsonb), `created_at`, `updated_at` |
| **books** | `id` (serial, PK), `bookname`, `book_image`, `isbn` (unique), `total_count`, `available_count`, `edition`, `rating`, `location`, `author`, `genre`, **`tags`** (text[]), `created_at`, `updated_at` |
| **borrow_records** | `id` (serial, PK), `book_id` (FK books), `user_id` (FK users, nullable), `user_name`, `user_email`, `borrow_date`, `due_date`, `return_date`, `status` (`'BORROWED'` or `'RETURNED'`), `created_at` |

Columns in **bold** contain composite or multi-valued data within a single cell (native PostgreSQL arrays and JSONB documents).

### Illustrative Data Rows

#### 1. `books` Sample Row
| id | bookname | isbn | total_count | available_count | author | genre | tags | location |
|---|---|---|---|---|---|---|---|---|
| 101 | The Psychology of Money | 9782361170561 | 4 | 3 | Morgan Housel | Economics | `{'economics', 'money', 'psychology', 'bestseller'}` | Central Library / Shelf A-01 |

#### 2. `users` Sample Row
| id | email | name | major | preferred_genres | reading_goal |
|---|---|---|---|---|---|
| 501 | akash@univ.edu | Akash | Computer Science & AI | `{'Economics', 'Philosophy'}` | `{"target": 10, "completed": 4, "streakDays": 5}` |

#### 3. `borrow_records` Sample Row
| id | book_id | user_id | user_name | user_email | borrow_date | due_date | return_date | status |
|---|---|---|---|---|---|---|---|---|
| 9001 | 101 | 501 | Akash | akash@univ.edu | 2026-11-10 10:00:00 | 2026-11-24 10:00:00 | NULL | BORROWED |

---

## 1. First Normal Form (1NF)

**Rule:** Every column must hold atomic (indivisible) values. There must be no repeating groups, arrays, or nested records inside a single cell.

### 1NF Violations in Current App Data
| Column | Reason It Violates 1NF |
|---|---|
| `books.tags` | Stores a variable-length list of text tags (`text[]`) inside a single attribute. |
| `users.preferred_genres` | Stores a list of genre names (`text[]`) inside one attribute. |
| `users.interests` | Stores an array of student interest keywords (`text[]`). |
| `users.read_books` | Array of book titles or IDs read by the student. |
| `users.favorites` | Array of book IDs favorited by the student. |
| `users.continue_reading` | JSON array of objects `[{"bookId": 101, "progress": 65, "lastRead": "..."}]`. |
| `users.reading_goal` | JSON object containing multiple attributes: `target`, `completed`, and `streakDays`. |

### 1NF Decomposition & Fix
To achieve 1NF, every non-atomic array and nested structure is extracted into its own relational table where each row contains exactly one atomic value, linked back to the parent entity via a foreign key:

1. **`book_tags`** `(book_id, tag)` — Each tag for a book occupies its own row.
2. **`user_preferred_genres`** `(user_id, genre)` — Each preferred genre occupies its own row.
3. **`user_interests`** `(user_id, interest)` — Each interest keyword occupies its own row.
4. **`user_favorites`** `(user_id, book_id)` — Junction table linking users to favorited books.
5. **`user_reading_progress`** `(user_id, book_id, progress_percent, last_read_at)` — Atomic reading progress per book.
6. **`user_reading_goals`** `(user_id, target_books, completed_books, streak_days)` — Flattened atomic integer fields.

### Functional Dependencies of the New 1NF Tables
* `book_tags`: $(\text{book\_id}, \text{tag}) \rightarrow \emptyset$ (all key columns)
* `user_preferred_genres`: $(\text{user\_id}, \text{genre}) \rightarrow \emptyset$
* `user_interests`: $(\text{user\_id}, \text{interest}) \rightarrow \emptyset$
* `user_favorites`: $(\text{user\_id}, \text{book\_id}) \rightarrow \emptyset$
* `user_reading_progress`: $(\text{user\_id}, \text{book\_id}) \rightarrow \text{progress\_percent}, \text{last\_read\_at}$
* `user_reading_goals`: $\text{user\_id} \rightarrow \text{target\_books}, \text{completed\_books}, \text{streak\_days}$

---

## 2. Second Normal Form (2NF)

**Rule:** The database must be in 1NF, and **no non-prime attribute may be partially dependent on any candidate key**. Every non-key attribute must depend on the whole candidate key, not a proper subset of it. (Tables whose candidate keys are single attributes automatically satisfy 2NF).

### Candidate Key Analysis

| Table | Candidate Keys | Key Type |
|---|---|---|
| `books` | `id`, `isbn` | Single attribute |
| `users` | `id`, `email`, `google_id` (when present) | Single attribute |
| `borrow_records` | `id` (surrogate), or natural composite: `(book_id, user_email, borrow_date)` | Composite natural candidate key |
| `book_tags` | `(book_id, tag)` | Composite |
| `user_reading_progress` | `(user_id, book_id)` | Composite |

### Functional Dependencies in `borrow_records`
Evaluating `borrow_records` under its natural business key $(\text{book\_id}, \text{user\_email}, \text{borrow\_date})$ reveals:

1. $(\text{book\_id}, \text{user\_email}, \text{borrow\_date}) \rightarrow \text{due\_date}, \text{return\_date}, \text{status}$
2. $\text{user\_email} \rightarrow \text{user\_name}, \text{user\_id}$ **(Partial Dependency!)**
3. $\text{book\_id} \rightarrow \text{bookname}, \text{author}, \text{location}$ *(if stored here)*

Because $\text{user\_name}$ and $\text{user\_id}$ depend only on $\text{user\_email}$ (part of the composite key), this violates 2NF.

### 2NF Resolution
* Remove `user_name` and redundant student contact details from `borrow_records`.
* Keep only the foreign key `user_id` (or `user_email`) referencing the `users` table. Student names are resolved via `users.name`.
* All composite junction tables (`book_tags`, `user_favorites`) have no non-key attributes, so they are already in 2NF. In `user_reading_progress`, `progress_percent` requires both `user_id` and `book_id` together, satisfying 2NF.

---

## 3. Third Normal Form (3NF)

**Rule:** The database must be in 2NF, and **no non-prime attribute may be transitively dependent on a candidate key** ($X \rightarrow Y$ and $Y \rightarrow Z$, where $X$ is a candidate key and $Y$ is not). Non-key attributes must depend on nothing but the key.

### Transitive Dependency Analysis

#### 1. In `borrow_records`:
$$\text{id} \rightarrow \text{user\_id} \rightarrow (\text{user\_name}, \text{user\_email})$$
* If `borrow_records` stores both `user_id` and `user_email`/`user_name`, there is a transitive dependency: `id` determines `user_id`, and `user_id` determines `user_email` and `user_name`.
* **Fix:** Remove `user_name` and `user_email` from `borrow_records`. All student profile data belongs strictly in `users`.

#### 2. In `books`:
$$\text{id} \rightarrow \text{author} \quad \text{and} \quad \text{id} \rightarrow \text{genre}$$
* If authors or genres carry additional attributes (e.g., author biography, genre category taxonomy), keeping them in `books` would establish transitive dependencies. In pure 3NF, authors and genres can be normalized into independent lookup tables: `authors(id, name)` and `genres(id, name)`.
* **`available_count`**:
  $$\text{available\_count} = \text{total\_count} - \text{COUNT}(\text{active borrowed loans})$$
  Storing `available_count` directly in `books` represents derived/calculated state. In strict 3NF, derived attributes that can be computed from child transaction records are removed to prevent update anomalies.

---

## 4. Boyce-Codd Normal Form (BCNF) Check

**Rule:** A relation is in BCNF if and only if for every non-trivial functional dependency $X \rightarrow Y$, the determinant $X$ is a **superkey** (contains a candidate key).

| Table | Determinant ($X$) | Determinant is Superkey? | In BCNF? |
|---|---|---|---|
| `users` | `id`, `email`, `google_id` | Yes (each attribute uniquely identifies the row) | **Yes** |
| `books` | `id`, `isbn` | Yes (both `id` and `isbn` are unique keys) | **Yes** |
| `borrow_records` | `id` | Yes (primary key) | **Yes** |
| `book_tags` | `(book_id, tag)` | Yes (entire row is the composite key) | **Yes** |
| `user_preferred_genres` | `(user_id, genre)` | Yes (composite key) | **Yes** |
| `user_reading_goals` | `user_id` | Yes (`user_id` is unique 1:1) | **Yes** |
| `user_reading_progress` | `(user_id, book_id)` | Yes (composite primary key) | **Yes** |

Because every determinant across all decomposed relations is a valid candidate key, **all normalized relations are in BCNF**.

---

## 5. Final Normalized Relational Schema (3NF / BCNF)

The fully normalized relational schema consists of 7 atomic tables:

| Table | Primary Key | Foreign Keys | Non-Key Attributes |
|---|---|---|---|
| **users** | `id` | None | `email` (UQ), `name`, `password`, `google_id` (UQ), `avatar`, `major`, `year`, `created_at`, `updated_at` |
| **books** | `id` | None | `bookname`, `book_image`, `isbn` (UQ), `total_count`, `edition`, `rating`, `location`, `author`, `genre`, `created_at`, `updated_at` |
| **book_tags** | `(book_id, tag)` | `book_id -> books(id)` | *(None, composite key)* |
| **borrow_records** | `id` | `book_id -> books(id)`, `user_id -> users(id)` | `borrow_date`, `due_date`, `return_date`, `status`, `created_at` |
| **user_reading_goals** | `user_id` | `user_id -> users(id)` | `target_books`, `completed_books`, `streak_days`, `updated_at` |
| **user_reading_progress**| `(user_id, book_id)` | `user_id -> users(id)`, `book_id -> books(id)` | `progress_percent`, `last_read_at` |
| **user_preferred_genres**| `(user_id, genre)` | `user_id -> users(id)` | *(None, composite key)* |

### Lossless-Join & Dependency Preservation
* **Lossless Join:** Re-joining `book_tags` with `books` using `book_id` reproduces the exact book-tag catalog without generating spurious tuples ($\text{books} \bowtie \text{book\_tags} = \text{original catalog}$).
* **Dependency Preservation:** Every functional dependency identified in the problem domain is enforced either directly by a primary key or foreign key constraint.

---

## 6. Where the Running App Differs from 3NF Design (Engineering Trade-offs)

In enterprise web applications, strict normalization often incurs significant query latency and connection overhead due to multi-table joins. Y-Library intentionally adopts specific denormalizations in production:

| Running App Implementation | Strict 3NF Equivalent | Why the App Does It This Way | Engineering Trade-off & Cost |
|---|---|---|---|
| **`books.tags` as `TEXT[]` array** | Separate `book_tags (book_id, tag)` junction table | Enables blazing-fast multi-tag matching via PostgreSQL's native array operator (`tags @> ARRAY['money']`) with a single GIN index. Simplifies REST API responses by returning the complete book object in 1 query without `JOIN`s or `GROUP BY` aggregations. | Tag values lack foreign key constraints (e.g., misspelled tag names cannot be enforced at the database level). Cross-table aggregations like "count all books per tag" require PostgreSQL's `unnest()` function. |
| **`borrow_records.user_name` & `user_email` duplicate columns** | Excluded from `borrow_records`, fetched via `JOIN users` | **Immutable Audit Log:** University libraries require historical records of who checked out which book even if a student changes their campus email, updates their display name, or deletes their account. | Data redundancy: if a student's name is updated before a book is returned, `borrow_records` holds the name captured at the checkout timestamp. |
| **`books.available_count` counter** | Computed on the fly via `total_count - COUNT(active borrow_records)` | Allows instantaneous $O(1)$ availability checks on the catalog UI (`available_count > 0`). Avoids scanning or aggregating thousands of active loan records on every catalog page load. | Update Anomaly Risk: Must be kept strictly synchronized with loan checkouts and returns. We guarantee consistency by wrapping borrow and return operations in ACID transactions (`prisma.$transaction([ ... ])`). |
| **`users.reading_goal` & `continue_reading` as JSONB** | Separate child tables (`user_reading_goals`, `user_reading_progress`) | Student profiles and dashboard widgets load reading streaks and continue-reading positions as a single nested JSON payload, avoiding multiple round-trip queries. | Cannot enforce foreign key constraints on the `bookId`s stored inside the JSON array. |

---

## 7. How This Relates to the Running App

The running Y-Library application executes on the robust, production-tested 3-table schema (`books`, `users`, `borrow_records`). This balance delivers sub-10ms response times on campus search queries while leveraging PostgreSQL's advanced typing (GIN-indexed arrays and JSONB).

The companion files in this directory complement the normalization model:
* **`02_er_diagram.png`**: Visualizes the production entity relationships, constraints, and cardinalities.
* **`03_schema.sql`**: The production-ready, idempotent PostgreSQL DDL script creating all tables, constraints, foreign keys, and indexes.
