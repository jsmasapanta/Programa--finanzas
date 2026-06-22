require("dotenv").config()

const required = (key) => {
  const value = process.env[key]
  if (!value) throw new Error(`Variable de entorno requerida: ${key}`)
  return value
}

module.exports = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development"
}
