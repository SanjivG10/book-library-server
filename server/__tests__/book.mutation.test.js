const { createTestClient } = require("apollo-server-testing");
const { ApolloServer, gql } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require("mongoose");

import BookMutation from "../graphql/resolvers/mutations/Book.mutation";
import UserMutation from "../graphql/resolvers/mutations/User.mutation";
import typeDefs from "../graphql/schema/schema.graphql";
import Book from "../models/Book";
import User from "../models/User";

const user = {
    username: "testuser",
    email: "testuser@example.com",
    password: "testpassword",
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Mutation: {
            ...UserMutation,
            ...BookMutation
        },
    },
});
const server = new ApolloServer({
    schema,
    context: () => {
        return {
            req: {
                headers: {
                    "authorization": `Bearer ${global?.createdUserForBookMutation?.token}`
                }
            },
            pubsub: {
                publish: jest.fn()
            }
        };
    },
});

// Set up test client
const { mutate } = createTestClient(server);

describe("Book Mutation all cases", () => {
    beforeAll(async () => {
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

        global.createdUserForBookMutation = registerUser.data.register;

    });

    afterAll(async () => {
        await User.deleteMany({});
        await Book.deleteMany({});
        await mongoose.connection.close();
    });


    describe("addBook", () => {
        it("should add a book to the database", async () => {
            // Log in the user

            // Add a book
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

            // Check that the book was added to the database
            const newBook = await Book.findById(addBookResult.data.addBook.id);
            expect(newBook).toBeDefined();
            expect(newBook.title).toBe("New Book");
            expect(newBook.author).toBe("New Author");
            expect(newBook.date).toBe("2023-01-01");
            expect(newBook.coverImage).toBe("newimage.jpg");
            expect(newBook.description).toBe("This is a new book.");
            expect(newBook.user.toString()).toBe(createdUserForBookMutation.id.toString());
        });

    })

    describe("finish book", () => {
        it("should mark the book as  finished", async () => {

            let bookId = "";
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
            bookId = addBookResult.data.addBook.id;
            const finishBookResult = await mutate({
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
            const result = finishBookResult.data.finishBook;
            expect(result).toBeDefined();
            expect(result.finished).toBe(true);
        });
    });

    describe("user rating", () => {
        it("should rate the book of the user ", async () => {

            let bookId = "";
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
            bookId = addBookResult.data.addBook.id;
            const addOrUpdateRatingResult = await mutate({
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
            const result = addOrUpdateRatingResult.data.addOrUpdateRating;
            expect(result.rating).toBe(5);
        });
    });

    describe("user book to shelf", () => {
        it("should rate the book ", async () => {

            let bookId = "";
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
            bookId = addBookResult.data.addBook.id;
            const addToShelfResult = await mutate({
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
            const result = addToShelfResult.data.addOrUpdateBookshelf;
            expect(result.collectionType).toBe("WANT_TO_READ");
        });
    });

    describe("updateBook", () => {

        it("should add a book to the database", async () => {
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

            const newBookId = addBookResult.data.addBook.id.toString();
            // Update the book
            const updateBookResult = await mutate({
                mutation: `
                mutation {
                    updateBook(
                        bookId: "${newBookId}",
                        title: "New Title",
                        author: "New Author",
                        date: "2023-01-01",
                        coverImage: "newimage.jpg",
                        description: "This is a new description."
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

            const updatedBookInDb = updateBookResult.data.updateBook;
            expect(updatedBookInDb.title).toBe("New Title");
            expect(updatedBookInDb.author).toBe("New Author");
            expect(updatedBookInDb.date).toBe("2023-01-01");
            expect(updatedBookInDb.coverImage).toBe("newimage.jpg");
            expect(updatedBookInDb.description).toBe("This is a new description.");
        });

        it("should throw an error if the user is not the owner of the book", async () => {
            // Create another user
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

            const newBookId = addBookResult.data.addBook.id;

            await mutate({
                mutation: gql`
          mutation {
            register(username: "otheruser", email: "aaa@gmail.com", password: "other") {
              id
              username
              email
              token
            }
          }
        `,
            });

            // Log in the other user
            const loginResult = await mutate({
                mutation: `
      mutation {
        login(username: "otheruser", password: "other") {
          id
          username
          email
          token
        }
      }
    `,
            });


            const tempUser = { ...global.createdUserForBookMutation };
            global.createdUserForBookMutation = loginResult.data.login;

            // Attempt to update the book with the other user's token
            const updateBookResult = await mutate({
                mutation: `
      mutation {
        updateBook(
          bookId: "${newBookId}",
          title: "New Title",
          author: "New Author",
          date: "2023-01-01",
          coverImage: "newimage.jpg",
          description: "This is a new description."
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

            global.createdUserForBookMutation = tempUser;
            expect(updateBookResult.errors).toBeDefined();

        });

    })





});
