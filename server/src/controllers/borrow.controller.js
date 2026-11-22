// Borrow Controller - Handles Book Loans, Return Transactions, and Due Dates
// Explains clearly to faculty how borrowing inventory decrements and increments

const prisma = require("../config/prisma");

/**
 * 1. BORROW A BOOK
 * - Verifies availableCount > 0
 * - Decrements availableCount by 1
 * - Records borrower details with 14-day due date
 */
async function borrowBook(req, res, next) {
  try {
    const { bookId, userName = "Student Reader", userEmail, days = 14 } = req.body;

    if (!bookId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "Book ID and userEmail are required to borrow a book.",
      });
    }

    const id = parseInt(bookId, 10);

    // 1. Check if book exists and has copies left
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found." });
    }

    const copiesAvailable = book.available_count ?? book.availableCount ?? 0;
    if (copiesAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: "Sorry, all physical copies of this book are currently on loan.",
      });
    }

    // 2. Calculate due date (default: 14 days loan period)
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + parseInt(days, 10));

    // 3. Perform Transaction: create borrow log AND decrease book count by 1
    const [borrowRecord, updatedBook] = await prisma.$transaction([
      prisma.borrowRecord.create({
        data: {
          bookId: id,
          userName,
          userEmail,
          borrowDate,
          dueDate,
          status: "BORROWED",
        },
      }),
      prisma.book.update({
        where: { id },
        data: {
          available_count: { decrement: 1 },
        },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: `Successfully borrowed "${book.bookname}". Due back on ${dueDate.toISOString().split("T")[0]}.`,
      data: {
        borrowRecord,
        available_count: updatedBook.available_count,
        availableCount: updatedBook.available_count,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 2. RETURN A BORROWED BOOK
 * - Marks borrow record as RETURNED
 * - Increments availableCount back by 1
 */
async function returnBook(req, res, next) {
  try {
    const borrowId = parseInt(req.params.id, 10);

    if (isNaN(borrowId)) {
      return res.status(400).json({ success: false, message: "Invalid borrow record ID." });
    }

    // Find the active borrow record
    const record = await prisma.borrowRecord.findUnique({
      where: { id: borrowId },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: "Borrow record not found." });
    }

    if (record.status === "RETURNED") {
      return res.status(400).json({
        success: false,
        message: "This book has already been returned.",
      });
    }

    // Perform Transaction: mark as returned AND increment available_count
    const [updatedRecord, updatedBook] = await prisma.$transaction([
      prisma.borrowRecord.update({
        where: { id: borrowId },
        data: {
          status: "RETURNED",
          returnDate: new Date(),
        },
      }),
      prisma.book.update({
        where: { id: record.bookId },
        data: {
          available_count: { increment: 1 },
        },
      }),
    ]);

    res.json({
      success: true,
      message: "Book returned successfully to the library shelf.",
      data: {
        updatedRecord,
        available_count: updatedBook.available_count,
        availableCount: updatedBook.available_count,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 3. GET USER'S BORROW HISTORY
 * Lists all books borrowed by a specific student
 */
async function getUserBorrows(req, res, next) {
  try {
    const { email } = req.params;

    const records = await prisma.borrowRecord.findMany({
      where: { userEmail: email },
      include: {
        book: true, // Join to get the book details
      },
      orderBy: { borrowDate: "desc" },
    });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  borrowBook,
  returnBook,
  getUserBorrows,
};
