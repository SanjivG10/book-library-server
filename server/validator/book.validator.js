import Joi from "joi";

const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().required(),
    coverImage: Joi.string().required(),
});

const bookUpdateSchema = Joi.object({
    title: Joi.string().required(),
    date: Joi.date().required(),
    username: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
});

const getCurrentUserBookStatusSchema = Joi.object({
    bookId: Joi.string().required(),
});

const idSchema = Joi.object({
    bookId: Joi.string().required(),
});


const addOrUpdateRatingSchema = Joi.object({
    bookId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
});

const addOrUpdateBookshelfSchema = Joi.object({
    bookId: Joi.string().required(),
    collectionType: Joi.string().valid('WANT_TO_READ', 'READING', 'READ').required(),
});

const paginationSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(10).optional(),
});

const getUserBooksSchema = Joi.object({
    collectionType: Joi.string().valid('WANT_TO_READ', 'READING', 'READ').required(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(10).optional(),
});

const getBookSchema = Joi.object({
    bookId: Joi.string().required(),
});

const finishBookSchema = Joi.object({
    bookId: Joi.string().required(),
});


export const bookValidationSchema = {
    Mutation: {
        addBook: bookSchema,
        updateBook: { ...bookUpdateSchema, ...idSchema },
        finishBook: finishBookSchema,
        addOrUpdateRating: addOrUpdateRatingSchema,
        addOrUpdateBookshelf: addOrUpdateBookshelfSchema,
    },
    Query: {
        getUserBooks: getUserBooksSchema,
        getAllBooks: paginationSchema,
        getBook: getBookSchema,
        userBookStatus: getCurrentUserBookStatusSchema,
    },
    Subscription: {
        bookUpdate: bookUpdateSchema,
    },
};


