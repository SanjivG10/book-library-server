const { createTestClient } = require("apollo-server-testing");
const { ApolloServer, gql } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

import typeDefs from "../graphql/schema/schema.graphql";
import UserMutation from "../graphql/resolvers/mutations/User.mutation";
import User from "../models/User";
import { JWT_SECRET } from "../constants/env-keys";


const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Mutation: {
            ...UserMutation,
        },
    },
});
const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
});

// Set up test client
const { mutate } = createTestClient(server);

describe("User Mutation Login and Register", () => {
    beforeAll(async () => {
        // Connect to test database
        const mongoDbUrl = process.env.MONGODB_TEST_URI || "mongodb://127.0.0.1/book-library-test"
        await mongoose.connect(mongoDbUrl);

        await User.deleteMany({});
    });

    afterAll(async () => {
        // Disconnect from test database
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe("register", () => {
        it("should create a new user", async () => {
            const username = "testuser12345";
            const email = "testuser1@example.com";
            const password = "password";

            const { data } = await mutate({
                mutation: gql`
          mutation {
            register(username: "${username}", email: "${email}", password: "${password}") {
              id
              username
              email
              token
            }
          }
        `,
            });

            const user = await User.findOne({ username });
            expect(user).toBeDefined();

            // Verify that response contains the correct user data
            expect(data.register.id).toBe(user.id.toString());
            expect(data.register.username).toBe(username);
            expect(data.register.email).toBe(email);

            // Verify that response contains a valid JWT token
            const decodedToken = jwt.verify(data.register.token, JWT_SECRET);
            expect(decodedToken.id).toBe(user.id.toString());
            expect(decodedToken.username).toBe(username);
        });

        it("should throw an error if username is already taken", async () => {
            // Create a user with the same username
            const existingUser = new User({
                username: "testuser66",
                email: "testuser66@example.com",
                password: await bcrypt.hash("password", 12),
            });
            await existingUser.save();

            // Execute register mutation with the same username
            const { errors } = await mutate({
                mutation: gql`
          mutation {
            register(username: "testuser66", email: "newuser@example.com", password: "newpassword") {
              id
              username
              email
              token
            }
          }
        `,
            });

            // Verify that an error is thrown
            expect(errors).toBeDefined();
            expect(errors[0].message).toBe("Username is taken");

            // Verify that no user was created in the database
            const user = await User.findOne({ username: "testuser" });
            expect(user).toBeDefined();
        });
    });

    describe("login", () => {
        beforeAll(async () => {
            // Connect to test database
            const mongoDbUrl = process.env.MONGODB_TEST_URI || "mongodb://127.0.0.1/book-library-test"
            await mongoose.connect(mongoDbUrl);
        });

        afterAll(async () => {
            // Disconnect from test database
            await User.deleteMany({});
            await mongoose.connection.close();
        });

        beforeEach(async () => {
            await User.deleteMany({});
        });

        describe("login", () => {
            it("should log in an existing user", async () => {
                const existingUser = new User({
                    username: "testuser10",
                    email: "testuser10@example.com",
                    password: await bcrypt.hash("password", 12),
                });
                await existingUser.save();

                const { data } = await mutate({
                    mutation: gql`
          mutation {
            login(username: "testuser10", password: "password") {
              id
              username
              email
              token
            }
          }
        `,
                });

                expect(data.login.id).toBe(existingUser.id.toString());
                expect(data.login.username).toBe(existingUser.username);
                expect(data.login.email).toBe(existingUser.email);

                const decodedToken = jwt.verify(data.login.token, JWT_SECRET);
                expect(decodedToken.id).toBe(existingUser.id.toString());
                expect(decodedToken.username).toBe(existingUser.username);
            });

            it("should throw an error if user does not exist", async () => {
                const { errors } = await mutate({
                    mutation: gql`
                        mutation {
                            login(username: "nonexistentuser", password: "password") {
                                id
                                username
                                email
                                token
                            }
                        }
        `,
                });

                expect(errors).toBeDefined();
            });

            it("should throw an error if password is incorrect", async () => {
                const existingUser = new User({
                    username: "testuser44",
                    email: "testuser44@example.com",
                    password: await bcrypt.hash("password", 12),
                });
                await existingUser.save();

                const { errors } = await mutate({
                    mutation: gql`
          mutation {
            login(username: "testuser44", password: "wrongpassword") {
              id
              username
              email
              token
            }
          }
        `,
                });

                expect(errors).toBeDefined();
            });
        });
    });



});
