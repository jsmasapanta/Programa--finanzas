const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  ingresoValidation,
  crearIngreso,
  obtenerIngresos,
  obtenerIngresoPorId,
  actualizarIngreso,
  eliminarIngreso
} = require("./ingresos.controller")

const router = express.Router()

router.use(authMiddleware)

router.post("/", ingresoValidation, validate, crearIngreso)
router.get("/", obtenerIngresos)
router.get("/:id", obtenerIngresoPorId)
router.put("/:id", ingresoValidation, validate, actualizarIngreso)
router.delete("/:id", eliminarIngreso)

module.exports = router
