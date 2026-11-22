// Book Controller - Handles all Book Catalog logic
// Explains clearly to faculty how CRUD and multi-tag filtering work

const prisma = require("../config/prisma");

/**
 * 1. GET ALL BOOKS
 * Supports search queries by:
 * - bookname (title)
 * - author
 * - isbn
 * - genre
 * - tags (e.g. ?tag=scifi or ?tag=money)
 */
async function getAllBooks(req, res, next) {
  try {
    const { search, genre, tag } = req.query;

    // Build the dynamic filter object for Prisma
    const whereConditions = {};

    // Filter by genre if supplied
    if (genre && genre !== "All") {
      whereConditions.genre = {
        equals: genre,
        mode: "insensitive",
      };
    }

    // Filter by specific tag if supplied (e.g. 'fiction', 'money', 'scifi')
    if (tag) {
      whereConditions.tags = {
        has: tag.toLowerCase(),
      };
    }

    // Free text search across title, author, isbn, or tags
    if (search && search.trim() !== "") {
      const query = search.trim();
      whereConditions.OR = [
        { bookname: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
        { isbn: { contains: query, mode: "insensitive" } },
        { tags: { has: query.toLowerCase() } },
      ];
    }

    // Fetch matching books from PostgreSQL, newest first
    const books = await prisma.book.findMany({
      where: whereConditions,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. GET SINGLE BOOK BY ID
 * Retrieves detailed information about one book by its database ID
 */
async function getBookById(req, res, next) {
  try {
    const bookId = parseInt(req.params.id, 10);

    if (isNaN(bookId)) {
      return res.status(400).json({ success: false, message: "Invalid book ID" });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        borrowRecords: {
          orderBy: { borrowDate: "desc" },
          take: 5, // Include recent 5 borrow history logs
        },
      },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. CREATE NEW BOOK
 * Adds a new book to the library catalog with Google Books URL and tags
 */
async function createBook(req, res, next) {
  try {
    const {
      bookname,
      book_image,
      bookImage,
      isbn,
      total_count,
      totalCount,
      available_count,
      availableCount,
      edition = "1st Edition",
      rating = 4.5,
      location,
      author,
      genre,
      tags = [],
    } = req.body;

    // Basic validation
    if (!bookname || !author || !isbn || !location || !genre) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing: bookname, author, isbn, location, and genre are required.",
      });
    }

    // Standardize tags to lowercase array for consistent searching
    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toLowerCase())
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim().toLowerCase())
      : [];

    const cover = book_image || bookImage || `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    const total = parseInt(total_count ?? totalCount ?? 1, 10);
    const available =
      available_count !== undefined
        ? parseInt(available_count, 10)
        : availableCount !== undefined
        ? parseInt(availableCount, 10)
        : total;

    const newBook = await prisma.book.create({
      data: {
        bookname,
        book_image: cover,
        isbn,
        total_count: total,
        available_count: available,
        edition,
        rating: rating !== null ? parseFloat(rating) : 4.5,
        location,
        author,
        genre,
        tags: cleanTags,
      },
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully to the catalog",
      data: newBook,
    });
  } catch (error) {
    // Check for unique ISBN violation
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists in the library catalog.",
      });
    }
    next(error);
  }
}

/**
 * 4. UPDATE BOOK
 * Modifies an existing book's details or count
 */
async function updateBook(req, res, next) {
  try {
    const bookId = parseInt(req.params.id, 10);

    const updateData = { ...req.body };

    // Format tags if updated
    if (updateData.tags) {
      updateData.tags = Array.isArray(updateData.tags)
        ? updateData.tags.map((t) => String(t).trim().toLowerCase())
        : updateData.tags.split(",").map((t) => t.trim().toLowerCase());
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 5. DELETE BOOK
 * Removes a book from the library catalog
 */
async function deleteBook(req, res, next) {
  try {
    const bookId = parseInt(req.params.id, 10);

    await prisma.book.delete({
      where: { id: bookId },
    });

    res.json({
      success: true,
      message: "Book deleted successfully from library records",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
