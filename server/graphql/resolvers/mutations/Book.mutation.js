
import checkAuth from "./../../../utils/auth.js"
import Book from "../../../models/Book.js";
import UserFinishBook from "../../../models/UserFinishBook.js";
import UserShelf from "../../../models/UserBookShelf.js";
import UserRating from "../../../models/UserRating.js";

const BookMutation = {
    async finishBook(_, { bookId }, context) {
        const user = checkAuth(context);
        const existingFinishedBook = await UserFinishBook.findOne({ user: user.id, book: bookId });

        if (existingFinishedBook) {
            existingFinishedBook.finished = !existingFinishedBook.finished;
            await existingFinishedBook.save();
            return existingFinishedBook;
        } else {
            const newFinishedBook = await UserFinishBook.create({ user: user.id, book: bookId, finished: true });
            return newFinishedBook;
        }
    },

    async addOrUpdateRating(_, { bookId, rating }, context) {
        const user = checkAuth(context);
        const existingRating = await UserRating.findOne({ user: user.id, book: bookId });

        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            return existingRating;
        } else {
            const newRating = await UserRating.create({ user: user.id, book: bookId, rating });
            return newRating;
        }
    },

    async addOrUpdateBookshelf(_, { bookId, collectionType }, context) {
        const user = checkAuth(context);
        const existingBookShelf = await UserShelf.findOne({ user: user.id, book: bookId });

        if (existingBookShelf) {
            existingBookShelf.collectionType = collectionType;
            await existingBookShelf.save();
            return existingBookShelf;
        } else {
            const newBookShelf = await UserShelf.create({ user: user.id, book: bookId, collectionType });
            await newBookShelf.save();
            return newBookShelf;
        }
    },

    async addBook(_, { title, author, date, coverImage, description }, context) {
        const user = checkAuth(context);

        const newBook = new Book({
            title,
            author,
            date,
            coverImage,
            description,
            user: user.id,
        });

        const book = await newBook.save();

        return book;
    },

    async updateBook(_, { bookId, title, author, date, coverImage, description }, context) {
        const user = checkAuth(context);
        const book = await Book.findById(bookId);

        if (!book) {
            throw new Error("Book not found");
        }

        if (book.user.toString() !== user.id) {
            throw new Error("Unauthorized");
        }

        if (title) book.title = title;
        if (author) book.author = author;
        if (description) book.description = description;
        if (date) book.date = date;
        if (coverImage) book.coverImage = coverImage;

        const updatedBook = await book.save();
        return updatedBook;
    }
}

export default BookMutation;