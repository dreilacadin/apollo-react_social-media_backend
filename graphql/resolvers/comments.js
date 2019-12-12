const { UserInputError, AuthenticationError } = require('apollo-server')

const Post = require('./../../models/Post')
const isAuth = require('./../../utils/check-auth')

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = isAuth(context)
      if (!body.trim()) {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty'
          }
        })
      }

      try {
        const post = await Post.findById(postId)
        if (post) {
          post.comments.push({
            body,
            username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          await post.save()
          context.pubsub.publish('NEW_COMMENT', {
            newComment: post
          })
          return post
        }
      } catch {
        throw new UserInputError('Post not found')
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = isAuth(context)

      try {
        const post = await Post.findById(postId)
        if (post) {
          const comment_index = post.comments.findIndex(c => c.id === commentId)

          if (post.comments[comment_index].username === username || post.username === username) {
            post.comments.splice(comment_index, 1)
            await post.save()
            return post
          } else {
            throw new AuthenticationError('Action not allowed, comment can only be deleted by comment author or post author')
          }
        } else {
          throw new UserInputError('Post not found')
        }
      } catch (err) {
        throw new UserInputError(err)
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = isAuth(context)

      try {
        const post = await Post.findById(postId)

        if (post) {
          if (post.likes.find(like => like.username === username)) {
            // Already liked, unlike post
            post.likes.filter(like => like.username !== username)
          } else {
            // Not yet liked, like post
            post.likes.push({
              username,
              createdAt: new Date().toISOString()
            })
          }
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Subscription: {
    newComment: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_COMMENT')
    }
  }
}