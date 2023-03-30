import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    token: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    date: String!
    coverImage: String!
    collection: Collection!
  }

  enum Collection {
    WANT_TO_READ
    READING
    READ
  }

  type Mutation {
    login(username: String!, password: String!): User!
    register(username: String!, email: String!, password: String!): User!
  }

type Query {
    getBooks(collection: String): [Book]
    getBook(bookId: ID!): Book
  }
 
`;

export default typeDefs;
