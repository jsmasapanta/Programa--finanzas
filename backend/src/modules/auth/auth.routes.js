const express = require("express")
const { register, login, profile } = require("./auth.controller")
const authMiddleware = require("../../middlewares/authMiddleware")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", authMiddleware, profile)

module.exports = router