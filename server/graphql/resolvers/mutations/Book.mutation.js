
import checkAuth from "./../../../utils/auth.js"
import Book from "../../../models/Book.js";

const BookMutation = {
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