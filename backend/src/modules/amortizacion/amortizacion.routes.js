const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearCuota,
  obtenerAmortizacionesPorDeuda,
  obtenerCuotaPorId,
  actualizarCuota,
  eliminarCuota
} = require("./amortizacion.controller")

const router = express.Router()

router.post("/", authMiddleware, crearCuota)
router.get("/:deudaId", authMiddleware, obtenerAmortizacionesPorDeuda)
router.get("/cuota/:id", authMiddleware, obtenerCuotaPorId)
router.put("/:id", authMiddleware, actualizarCuota)
router.delete("/:id", authMiddleware, eliminarCuota)

module.exports = router