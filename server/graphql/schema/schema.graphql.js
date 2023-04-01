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
    rating: Int
    collectionType: collectionType
  }

  enum collectionType {
    WANT_TO_READ
    READING
    READ
  }

  type UserBookRating {
    id: ID!
    book: ID!
    user: ID!
    rating: Int!
  }

  type UserFinishedBook {
    id: ID!
    book: ID!
    user: ID!
    finished: Boolean!
  }

  type UserBookShelf {
    id: ID!
    name: String!
    user:ID!
    collectionType: collectionType!
    book: ID!
  }



  type Mutation {
    login(username: String!, password: String!): User!
    register(username: String!, email: String!, password: String!): User!
    addBook(title: String!, author: String!, date: String!, coverImage: String!,description:String!): Book!
    updateBook(bookId: ID!, title: String!, author: String!, date: String!, coverImage: String!): Book!

    finishBook(bookId: ID!): UserFinishedBook!
    addOrUpdateRating(bookId: ID!,  rating: Int!): UserBookRating!
    addOrUpdateBookshelf( bookId: ID!, collectionType: collectionType!): UserBookShelf!

  }

type PaginatedBook {
  books: [Book]
  hasMore: Boolean
}  

type CurrentUserBookStatus {
    collectionType: collectionType
    rating: Int
    finished: Boolean
}

type BookUpdate {
  title: String!
  date: String!
  username: String!
  rating: Int!
}

type Subscription {
  bookUpdate: BookUpdate!
}

type Query {
    getUserBooks(collectionType: collectionType!,page:Int,limit:Int): PaginatedBook 
    getAllBooks(page:Int,limit:Int): PaginatedBook
    getBook(bookId: ID!): Book

    userBookStatus(bookId:ID!): CurrentUserBookStatus!
    me: User!
  }
 
`;

export default typeDefs;
