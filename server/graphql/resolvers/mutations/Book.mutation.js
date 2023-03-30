
import Book from "../../../models/Book.js";

const BookMutation = {
    async addBook(_, { title, author, date, coverImage, collectionType }, context) {
        const user = checkAuth(context);

        const newBook = new Book({
            title,
            author,
            date,
            coverImage,
            collectionType,
            user: user.id,
        });

        const book = await newBook.save();

        return book;
    },
}

export default BookMutation;