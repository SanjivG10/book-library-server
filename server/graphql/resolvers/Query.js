import Book from "../../models/Book.js";
import checkAuth from "../../utils/auth.js";

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

    async getBook(_, { bookId }, context) {
        try {
            const user = checkAuth(context);
            const book = await Book.findById(bookId);

            if (!book) {
                throw new Error("Book not found");
            }

            if (book.user.toString() !== user.id) {
                throw new Error("Unauthorized");
            }

            return book;
        } catch (err) {
            throw new Error(err);
        }
    },
};

export default Query;
