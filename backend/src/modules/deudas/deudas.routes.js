const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const {
  deudaValidation,
  crearDeuda,
  obtenerDeudas,
  obtenerDeudaPorId,
  actualizarDeuda,
  eliminarDeuda
} = require("./deudas.controller")

const router = express.Router()
router.use(authMiddleware)

router.post("/", deudaValidation, validate, crearDeuda)
router.get("/", obtenerDeudas)
router.get("/:id", obtenerDeudaPorId)
router.put("/:id", deudaValidation, validate, actualizarDeuda)
router.delete("/:id", eliminarDeuda)

module.exports = router
