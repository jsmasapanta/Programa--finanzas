const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearIngreso,
  obtenerIngresos,
  actualizarIngreso,
  eliminarIngreso
} = require("./ingresos.controller")

const router = express.Router()

router.post("/", authMiddleware, crearIngreso)
router.get("/", authMiddleware, obtenerIngresos)
router.put("/:id", authMiddleware, actualizarIngreso)
router.delete("/:id", authMiddleware, eliminarIngreso)

module.exports = router