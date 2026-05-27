const jwt = require("jsonwebtoken")
const env = require("../config/env")

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  )
}

module.exports = {
  generateToken
}