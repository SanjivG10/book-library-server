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
    description: String!
    date: String!
    coverImage: String!
    user:String!
  }

  enum collectionType {
    WANT_TO_READ
    READING
    READ
  }

  type Mutation {
    login(username: String!, password: String!): User!
    register(username: String!, email: String!, password: String!): User!
    addBook(title: String!, author: String!, date: String!, coverImage: String!,description:String!): Book!
    updateBook(bookId: ID!, title: String!, author: String!, date: String!, coverImage: String!): Book!
    finishBook(bookId: ID!, rating: Int!): Book!
  }

type PaginatedBook {
  items: [Book]
  totalCount: Int
}  

type Query {
    getBooks(collectionType: String): [Book]
    getAllBooks(page:Int,limit:Int): PaginatedBook
    
    getBook(bookId: ID!): Book
    me: User!
  }
 
`;

export default typeDefs;
