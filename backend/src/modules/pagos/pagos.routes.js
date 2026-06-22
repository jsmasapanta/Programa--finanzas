const express = require("express")
const authMiddleware = require("../../middlewares/authMiddleware")
const validate = require("../../middlewares/validate")
const { pagoValidation, crearPago, obtenerPagos, obtenerPagoPorId } = require("./pagos.controller")

const router = express.Router()
router.use(authMiddleware)

router.post("/", pagoValidation, validate, crearPago)
router.get("/", obtenerPagos)
router.get("/:id", obtenerPagoPorId)

module.exports = router
