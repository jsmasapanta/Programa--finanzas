const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  cuotaValidation, cuotaUpdateValidation,
  generarTablaAmortizacion,
  crearCuota,
  obtenerAmortizacionesPorDeuda,
  obtenerCuotaPorId,
  actualizarCuota,
  eliminarCuota
} = require("./amortizacion.controller")

const router = express.Router()
router.use(authMiddleware)

// Generar tabla automáticamente desde datos de la deuda
router.post("/generar/:deudaId", generarTablaAmortizacion)

// CRUD manual de cuotas
router.post("/", cuotaValidation, validate, crearCuota)
router.get("/deuda/:deudaId", obtenerAmortizacionesPorDeuda)
router.get("/cuota/:id", obtenerCuotaPorId)
router.put("/:id", cuotaUpdateValidation, validate, actualizarCuota)
router.delete("/:id", eliminarCuota)

module.exports = router
