const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  gastoValidation,
  crearGasto,
  obtenerGastos,
  obtenerGastoPorId,
  actualizarGasto,
  eliminarGasto
} = require("./gastos.controller")

const router = express.Router()
router.use(authMiddleware)

router.post("/", gastoValidation, validate, crearGasto)
router.get("/", obtenerGastos)
router.get("/:id", obtenerGastoPorId)
router.put("/:id", gastoValidation, validate, actualizarGasto)
router.delete("/:id", eliminarGasto)

module.exports = router
