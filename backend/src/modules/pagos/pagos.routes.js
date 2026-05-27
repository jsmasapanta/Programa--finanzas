const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId
} = require("./pagos.controller")

const router = express.Router()

router.post("/", authMiddleware, crearPago)
router.get("/", authMiddleware, obtenerPagos)
router.get("/:id", authMiddleware, obtenerPagoPorId)

module.exports = router