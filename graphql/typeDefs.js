const { gql } = require('apollo-server')

module.exports = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String
    token: String!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    _id: ID!
    body: String!
    username: String!
    comments: [Comment]!
    likes: [Like]!
    commentsCount: Int!
    likesCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    _id: ID!
    body: String!
    username: String!
    createdAt: String!
    updatedAt: String
  }

  type Like {
    _id: ID!
    username: String!
    createdAt: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    confirmPassword: String!
  }

  type Query {
    getUsers: [User]
    getPosts: [Post]
    getPost(postId: ID!): Post
  }

  type Mutation {
    registerUser(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createPost(body: String!): Post!
    deletePost(postId: ID!): String!
    createComment(postId: ID!, body: String!): Post!
    deleteComment(postId: ID!, commentId: ID!): Post!
    likePost(postId: ID!): Post!
  }

  type Subscription {
    newPost: Post!
    newLike: Post!
    newComment: Post!
  }
`