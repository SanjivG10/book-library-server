import Book from "../../../models/Book.js";
import checkAuth from "../../../utils/auth.js";

const Query = {
    async getBooks(_, { collectionType }, context) {
        try {
            const user = checkAuth(context);

            let books;
            if (collectionType) {
                books = await Book.find({ user: user.id, collectionType: collectionType });
            } else {
                books = await Book.find({ user: user.id });
            }
            return books;
        } catch (err) {
            throw new Error(err);
        }
    },
    async getAllBooks(_, { limit = 10, page = 1 }, context) {
        try {
            const books = await Book.findWithPagination(limit, page);
            const totalCount = await Book.countDocuments();
            return { items: books, totalCount };


        } catch (err) {
            throw new Error(err);
        }
    },

    async getBook(_, { bookId }, context) {
        try {
            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Book not found");
            }

            return book;
        } catch (err) {
            throw new Error(err);
        }
    },
};

export default Query;
