
const { createTestClient } = require("apollo-server-testing");
const { ApolloServer, gql } = require("apollo-server-express");
const { makeExecutableSchema } = require('@graphql-tools/schema');
const mongoose = require("mongoose");

import UserMutation from "../graphql/resolvers/mutations/User.mutation";
import UserQuery from "../graphql/resolvers/queries/me.query";
import typeDefs from "../graphql/schema/schema.graphql";
import User from "../models/User";

const schema = makeExecutableSchema({
    typeDefs,
    resolvers: {
        Query: {
            ...UserQuery,
        },
        Mutation: {
            ...UserMutation
        }
    },
});
const server = new ApolloServer({
    schema,
    context: () => {
        return {
            req: {
                headers: {
                    "authorization": `Bearer ${global?.createdUserForUserQuery?.token}`
                }
            },
        };
    },
});

// Set up test client
const { query, mutate } = createTestClient(server);

describe("User me", () => {
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

    describe("me", () => {
        it("should create a new user and me should return something", async () => {
            const username = "testuser1";
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

            global.createdUserForUserQuery = data.register;

            const meResult = await query({
                mutation: gql`
                    query{
                        me {
                        id
                        }
                    }`});

            expect(data.register.id.toString()).toBe(meResult.data.me.id);
        });

    });


});
