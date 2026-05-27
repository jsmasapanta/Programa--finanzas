const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearGasto,
  obtenerGastos,
  actualizarGasto,
  eliminarGasto
} = require("./gastos.controller")

const router = express.Router()

router.post("/", authMiddleware, crearGasto)
router.get("/", authMiddleware, obtenerGastos)
router.put("/:id", authMiddleware, actualizarGasto)
router.delete("/:id", authMiddleware, eliminarGasto)

module.exports = router