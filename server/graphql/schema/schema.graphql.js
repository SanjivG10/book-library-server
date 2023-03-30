import { gql } from ("apollo-server-express");

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

  type Query {
    getBooks(collection: Collection): [Book]
    getBook(bookId: ID!): Book
  }

  type Mutation {
    login(username: String!, password: String!): User!
    register(username: String!, email: String!, password: String!): User!
    addBook(title: String!, author: String!, date: String!, coverImage: String!, collection: Collection!): Book!
    updateBook(bookId: ID!, title: String, author: String, date: String, coverImage: String, collection: Collection): Book!
    finishBook(bookId: ID!, rating: Int!): Book!
  }

  type Subscription {
    bookFinished: BookUpdate!
  }

  type BookUpdate {
    bookId: ID!
    title: String!
    date: String!
    rating: Int!
  }
`;

export default typeDefs;
