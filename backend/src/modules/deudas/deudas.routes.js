const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const {
  crearDeuda,
  obtenerDeudas,
  obtenerDeudaPorId,
  actualizarDeuda,
  eliminarDeuda
} = require("./deudas.controller")

const router = express.Router()

router.post("/", authMiddleware, crearDeuda)
router.get("/", authMiddleware, obtenerDeudas)
router.get("/:id", authMiddleware, obtenerDeudaPorId)
router.put("/:id", authMiddleware, actualizarDeuda)
router.delete("/:id", authMiddleware, eliminarDeuda)

module.exports = router