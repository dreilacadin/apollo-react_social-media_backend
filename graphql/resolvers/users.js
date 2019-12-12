const User = require('./../../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { UserInputError } = require('apollo-server')

const { SECRET_KEY } = require('./../../config')
const { validateRegisterInput, validateLoginInput } = require('./../../utils/validator')

const generateToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
    username: user.username
  }, SECRET_KEY, { expiresIn: "1h" })
}

module.exports = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.find()
        return users
      } catch (err) {
        throw new Error(err)
      }
    }
  },
  Mutation: {
    login: async (_, { username, password }) => {
      const { valid, errors } = validateLoginInput(username, password)
      if (!valid) {
        throw new UserInputError('Errors', {
          errors
        })
      }

      const user = await User.findOne({ username })

      if (!user) {
        errors.general = 'User not found'
        throw new UserInputError('User not found', { errors })
      }

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        errors.general = 'Wrong Credentials'
        throw new UserInputError('Wrong Credentials', { errors })
      }

      const token = generateToken(user)

      return { ...user._doc, _id: user._id, token, password: null }
    },
    registerUser: async (_, { registerInput }) => {
      const { valid, errors } = validateRegisterInput(registerInput)
      if (!valid) {
        throw new UserInputError('Errors', {
          errors
        })
      }
      try {
        const existingUser = await User.findOne({ username: registerInput.username })
        if (existingUser) {
          throw new UserInputError('Username is taken', {
            errors: {
              message: 'This username is taken'
            }
          })
        }

        const hashedPassword = await bcrypt.hash(registerInput.password.trim(), 12)
        const user = new User({
          username: registerInput.username.trim(),
          email: registerInput.email.trim(),
          password: hashedPassword
        })
        const result = await user.save()
        const token = generateToken(result)
        return { ...result._doc, _id: result._id, token, password: null }
      } catch (err) {
        throw new Error(err)
      }
    }
  }
}