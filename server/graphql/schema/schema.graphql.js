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
    collectionType: collectionType!
  }

  enum collectionType {
    WANT_TO_READ
    READING
    READ
  }

  type Mutation {
    login(username: String!, password: String!): User!
    register(username: String!, email: String!, password: String!): User!
    addBook(title: String!, author: String!, date: String!, coverImage: String!, collectionType: collectionType!): Book!
    updateBook(bookId: ID!, title: String, author: String, date: String, coverImage: String, collectionType: collectionType): Book!
    finishBook(bookId: ID!, rating: Int!): Book!
  }

  

type Query {
    getBooks(collectionType: String): [Book]
    getBook(bookId: ID!): Book
    me: User!
  }
 
`;

export default typeDefs;
