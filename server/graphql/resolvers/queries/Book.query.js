import Book from "../../../models/Book.js";
import checkAuth from "../../../utils/auth.js";

import Bookshelf from "../../../models/UserBookShelf.js"
import UserRating from "../../../models/UserRating.js"
import UserFinishedBook from "../../../models/UserFinishBook.js"

const Query = {
    async getBooks(_, { collectionType }, context) {
        const user = checkAuth(context);

        let books;
        if (collectionType) {
            books = await Book.find({ user: user.id, collectionType: collectionType });
        } else {
            books = await Book.find({ user: user.id });
        }
        return books;
    },
    async getAllBooks(_, { limit = 10, page = 1 }, context) {
        const books = await Book.findWithPagination(limit, page);
        const totalCount = await Book.countDocuments();
        return { items: books, totalCount };
    },

    async getBook(_, { bookId }, context) {
        const book = await Book.findById(bookId);
        if (!book) {
            throw new Error("Book not found");
        }

        return book;
    },

    async userBookStatus(_, { bookId }, context) {
        const user = checkAuth(context);
        const book = await Book.findById(bookId);
        const userRating = await UserRating.findOne({ book: book.id, user: user.id });
        const userShelf = await Bookshelf.findOne({ book: book.id, user: user.id });
        const userFinish = await UserFinishedBook.findOne({ book: book.id, user: user.id });

        return {
            collectionType: userShelf?.collectionType || null,
            rating: userRating?.rating || null,
            finished: userFinish?.finished || false
        }
    }
};

export default Query;
