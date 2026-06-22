const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  tarjetaValidation,
  crearTarjeta,
  obtenerTarjetas,
  obtenerTarjetaPorId,
  actualizarTarjeta,
  eliminarTarjeta
} = require("./tarjetas.controller")

const router = express.Router()
router.use(authMiddleware)

router.post("/", tarjetaValidation, validate, crearTarjeta)
router.get("/", obtenerTarjetas)
router.get("/:id", obtenerTarjetaPorId)
router.put("/:id", tarjetaValidation, validate, actualizarTarjeta)
router.delete("/:id", eliminarTarjeta)

module.exports = router
