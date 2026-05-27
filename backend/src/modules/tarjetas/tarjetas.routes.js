const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearTarjeta,
  obtenerTarjetas,
  obtenerTarjetaPorId,
  actualizarTarjeta,
  eliminarTarjeta
} = require("./tarjetas.controller")

const router = express.Router()

router.post("/", authMiddleware, crearTarjeta)
router.get("/", authMiddleware, obtenerTarjetas)
router.get("/:id", authMiddleware, obtenerTarjetaPorId)
router.put("/:id", authMiddleware, actualizarTarjeta)
router.delete("/:id", authMiddleware, eliminarTarjeta)

module.exports = router