const Post = require('./../../models/Post')

const isAuth = require('./../../utils/check-auth')

module.exports = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: 'desc' })
        return posts;
      } catch (err) {
        throw new Error(err)
      }
    },
    getPost: async (_, { postId }) => {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post
        }
        else {
          throw new Error('Post not found')
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    createPost: async (_, { body }, context) => {
      const user = isAuth(context)

      const newPost = new Post({
        body,
        user: user._id,
        username: user.username
      })

      const post = await newPost.save()
      context.pubsub.publish('NEW_POST', {
        newPost: post
      })
      return post
    },
    deletePost: async (_, { postId }, context) => {
      const user = isAuth(context)

      try {
        const post = await Post.findById(postId)
        if (!post) {
          throw new Error('Post does not exist')
        }
        if (post.username === user.username) {
          await post.delete()
          return 'Post deleted succesfully'
        } else {
          throw new Error('You can only delete your own post')
        }
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
    }
  }
}