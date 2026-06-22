const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  register, registerValidation,
  login, loginValidation,
  profile,
  updateProfile, updateProfileValidation
} = require("./auth.controller")

const router = express.Router()

router.post("/register", registerValidation, validate, register)
router.post("/login", loginValidation, validate, login)
router.get("/profile", authMiddleware, profile)
router.patch("/profile", authMiddleware, updateProfileValidation, validate, updateProfile)

module.exports = router
