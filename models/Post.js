const { model, Schema } = require('mongoose')

const postSchema = new Schema({
  body: String,
  username: String,
  comments: [
    {
      body: String,
      username: String,
      createdAt: Date,
      updatedAt: Date
    }
  ],
  likes: [
    {
      username: String,
      createdAt: Date
    }
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  }
}, { timestamps: true })

module.exports = model('Post', postSchema)