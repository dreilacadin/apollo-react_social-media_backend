const Post = require('./../../models/Post')
const isAuth = require('./../../utils/check-auth')

module.exports = {
  Mutation: {
    likePost: async (_, { postId }, context) => {
      const { username } = isAuth(context)

      try {
        const post = await Post.findById(postId)

        if (post) {
          if (post.likes.find(like => like.username === username)) {
            // Already liked, unlike post
            post.likes = post.likes.filter(like => like.username !== username)
          } else {
            // Not yet liked, like post
            post.likes.push({
              username,
              createdAt: new Date().toISOString()
            })
          }
          await post.save()
          context.pubsub.publish('LIKE_CHANGE', {
            newLike: post
          })
          return post
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Subscription: {
    newLike: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('LIKE_CHANGE')
    }
  }
}