

const { createTestClient } = require("apollo-server-testing");
const { ApolloServer, gql } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require("mongoose");

import UserMutation from "../graphql/resolvers/mutations/User.mutation";
import BookMutation from "../graphql/resolvers/mutations/Book.mutation";
import BookQuery from "../graphql/resolvers/queries/Book.query";
import typeDefs from "../graphql/schema/schema.graphql";
import User from "../models/User";
import Book from "../models/Book";

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Query: {
            ...BookQuery,
        },
        Mutation: {
            ...UserMutation,
            ...BookMutation
        }
    },
});
const server = new ApolloServer({
    schema,
    context: () => {
        return {
            req: {
                headers: {
                    "authorization": `Bearer ${global?.createdUser?.token}`
                }
            },
        };
    },
});

// Set up test client
const { query, mutate } = createTestClient(server);

const user = {
    username: "testuser",
    email: "testuser@example.com",
    password: "testpassword",
};

describe("Get Books", () => {
    beforeAll(async () => {
        // Connect to test database

        const mongoDbUrl = process.env.MONGODB_TEST_URI || "mongodb://127.0.0.1/book-library-test"
        await mongoose.connect(mongoDbUrl);
        await User.deleteMany({});
        await Book.deleteMany({});
        const registerUser = await mutate({
            mutation: gql`
          mutation {
            register(username: "${user.username}", email: "${user.email}", password: "${user.password}") {
              id
              username
              email
              token
            }
          }
        `,
        });

        global.createdUser = registerUser.data.register;
    });

    afterAll(async () => {
        // Disconnect from test database
        await User.deleteMany({});
        await Book.deleteMany({});
        await mongoose.connection.close();
    });


    describe("book query", () => {

        it("get all books for home page", async () => {
            await mutate({
                mutation: `
                    mutation {
                        addBook(
                            title: "New Book",
                            author: "New Author",
                            date: "2023-01-01",
                            coverImage: "newimage.jpg",
                            description: "This is a new book."
                        ) {
                            id
                            title
                            author
                            date
                            coverImage
                            description
                            user
                        }
                    }
                `,
            });
            const bookResult = await query({
                query: gql`
                    query{
                        getAllBooks {
                            books {
                                id
                            }
                            hasMore
                        }
                    }`});

            expect(bookResult.data.getAllBooks.books.length).toBeGreaterThan(0);
        })

        it("get a single book", async () => {
            const bookAddResult = await mutate({
                mutation: `
                    mutation {
                        addBook(
                            title: "New Book",
                            author: "New Author",
                            date: "2023-01-01",
                            coverImage: "newimage.jpg",
                            description: "This is a new book."
                        ) {
                            id
                            title
                            author
                            date
                            coverImage
                            description
                            user
                        }
                    }
                `,
            });

            const bookResult = await query({
                query: gql`
                    query{
                        getBook(bookId: "${bookAddResult.data.addBook.id.toString()}") {
                            id
                        }
                    }`});

            expect(bookResult.data.getBook.id).toBeDefined();
        })

        it("get books of current user", async () => {
            const addBookResult = await mutate({
                mutation: `
                    mutation {
                        addBook(
                            title: "New Book",
                            author: "New Author",
                            date: "2023-01-01",
                            coverImage: "newimage.jpg",
                            description: "This is a new book."
                        ) {
                            id
                        }
                    }
                `,
            });
            await mutate({
                mutation: `
                    mutation {
                        addOrUpdateBookshelf(
                            bookId:"${addBookResult.data.addBook.id}",
                            collectionType: WANT_TO_READ
                        ) {
                            id
                            collectionType
                        }
                    }
                `});

            const bookResult = await query({
                query: gql`
                    query{
                        getUserBooks(collectionType:WANT_TO_READ) {
                            books {
                                id
                            }
                            hasMore
                        }
                    }`});

            expect(bookResult.data.getUserBooks.books.length).toEqual(1);
        })

        it("get current user book status", async () => {
            const addBookResult = await mutate({
                mutation: `
                    mutation {
                        addBook(
                            title: "New Book",
                            author: "New Author",
                            date: "2023-01-01",
                            coverImage: "newimage.jpg",
                            description: "This is a new book."
                        ) {
                            id
                        }
                    }
                `,
            });
            const bookId = addBookResult.data.addBook.id;
            await mutate({
                mutation: `
                    mutation {
                        addOrUpdateRating(
                            bookId:"${bookId.toString()}",
                            rating: 5
                        ) {
                            id
                            rating
                        }
                    }
                `});
            await mutate({
                mutation: `
                    mutation {
                        addOrUpdateBookshelf(
                            bookId:"${bookId.toString()}",
                            collectionType: WANT_TO_READ
                        ) {
                            id
                            collectionType
                        }
                    }
                `});
            await mutate({
                mutation: `
                    mutation {
                        finishBook(
                            bookId:"${bookId.toString()}"
                        ) {
                            id
                            finished
                        }
                    }
                `});


            const bookResult = await query({
                query: gql`
                    query{
                        userBookStatus(bookId:"${bookId.toString()}") {
                            collectionType
                            rating
                            finished
                        }
                    }`});
            const userBookStatus = bookResult.data.userBookStatus;
            expect(userBookStatus.collectionType).toEqual("WANT_TO_READ");
            expect(userBookStatus.rating).toEqual(5);
            expect(userBookStatus.finished).toEqual(true);
        });


    });


});
