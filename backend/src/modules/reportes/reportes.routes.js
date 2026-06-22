const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  obtenerResumen,
  obtenerGastosPorCategoria,
  obtenerIngresosVsGastos,
  obtenerResumenDeudas,
  obtenerProximosPagos,
  obtenerFlujoCaja
} = require("./reportes.controller")

const router = express.Router()
router.use(authMiddleware)

router.get("/resumen", obtenerResumen)
router.get("/gastos-categoria", obtenerGastosPorCategoria)  // ?fechaDesde=&fechaHasta=
router.get("/ingresos-vs-gastos", obtenerIngresosVsGastos)  // ?meses=6
router.get("/deudas", obtenerResumenDeudas)
router.get("/proximos-pagos", obtenerProximosPagos)         // ?dias=30
router.get("/flujo-caja", obtenerFlujoCaja)                 // ?meses=3

module.exports = router
