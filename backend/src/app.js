const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const authRoutes = require("./modules/auth/auth.routes")

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get("/health", (req, res) => {
  res.json({
    message: "Backend finanzas funcionando"
  })
})

app.use("/api/auth", authRoutes)

module.exports = app