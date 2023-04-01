import Book from "../../../models/Book.js";
import checkAuth from "../../../utils/auth.js";

import Bookshelf from "../../../models/UserBookShelf.js"
import UserRating from "../../../models/UserRating.js"
import UserFinishedBook from "../../../models/UserFinishBook.js"


const DESCRIPTION_LENGTH = 50;

const Query = {
    async getUserBooks(_, { collectionType, limit = 10, page = 1 }, context) {
        const user = checkAuth(context);
        const pageLimit = Math.min(limit, 10);

        const bookIds = await Bookshelf
            .find({ user: user.id, collectionType })
            .sort({ "_id": -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .distinct('book');

        const books = await Book
            .find({ _id: { $in: bookIds } });

        const booksWithCutOffDescription = books.map((book) => ({ ...book._doc, description: book._doc.description.substring(0, DESCRIPTION_LENGTH), id: book._doc._id, collectionType })) || []
        const hasMore = (books?.length || 0) > pageLimit;

        return {
            books: booksWithCutOffDescription,
            hasMore
        }



    },
    async getAllBooks(_, { limit = 10, page = 1 }, context) {
        const pageLimit = Math.min(limit, 10);
        const books = await Book.findWithPagination(pageLimit + 1, page);
        const booksWithCutOffDescription = books.map((book) => ({ ...book._doc, description: book._doc.description.substring(0, DESCRIPTION_LENGTH), id: book._doc._id })) || []
        const hasMore = (books?.length || 0) > pageLimit;
        return { books: booksWithCutOffDescription, hasMore };
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
