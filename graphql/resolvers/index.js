const usersResolvers = require('./users')
const postsResolvers = require('./posts')
const commentsResolvers = require('./comments')
const likesResolvers = require('./likes')

module.exports = {
  Post: {
    commentsCount: (parent) => parent.comments.length,
    likesCount: (parent) => parent.likes.length
  },
  Query: {
    ...postsResolvers.Query,
    ...usersResolvers.Query
  },
  Mutation: {
    ...postsResolvers.Mutation,
    ...usersResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...likesResolvers.Mutation
  },
  Subscription: {
    ...postsResolvers.Subscription,
    ...commentsResolvers.Subscription,
    ...likesResolvers.Subscription
  }
}