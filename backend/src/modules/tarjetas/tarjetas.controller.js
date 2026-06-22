const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse } = require("../../utils/pagination")

const FRANQUICIAS = ["VISA", "MASTERCARD", "AMEX", "DINERS", "DISCOVER", "OTRA"]
const ESTADOS = ["ACTIVA", "BLOQUEADA", "CANCELADA"]

const addDisponible = (t) => ({
  ...t,
  disponible: Number(t.cupoTotal) - Number(t.saldoUsado),
  porcentajeUso: Number(t.cupoTotal) > 0
    ? Math.round((Number(t.saldoUsado) / Number(t.cupoTotal)) * 100)
    : 0
})

// ── Validaciones ─────────────────────────────────────────────────────────────

const tarjetaValidation = [
  body("banco").trim().notEmpty().withMessage("El banco es obligatorio").isLength({ max: 100 }),
  body("nombreTarjeta").trim().notEmpty().withMessage("El nombre de tarjeta es obligatorio").isLength({ max: 100 }),
  body("franquicia").isIn(FRANQUICIAS).withMessage(`Franquicia debe ser: ${FRANQUICIAS.join(", ")}`),
  body("cupoTotal").isFloat({ gt: 0 }).withMessage("cupoTotal debe ser mayor a 0"),
  body("saldoUsado").isFloat({ min: 0 }).withMessage("saldoUsado debe ser >= 0"),
  body("pagoMinimo").optional({ nullable: true }).isFloat({ min: 0 }),
  body("fechaCorte").isInt({ min: 1, max: 31 }).withMessage("fechaCorte debe ser entre 1 y 31"),
  body("fechaPago").isInt({ min: 1, max: 31 }).withMessage("fechaPago debe ser entre 1 y 31"),
  body("tasaInteres").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
  body("estado").optional().isIn(ESTADOS).withMessage(`Estado debe ser: ${ESTADOS.join(", ")}`),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 })
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const crearTarjeta = async (req, res, next) => {
  try {
    const { banco, nombreTarjeta, franquicia, cupoTotal, saldoUsado, pagoMinimo, fechaCorte, fechaPago, tasaInteres, estado, descripcion } = req.body

    if (parseFloat(saldoUsado) > parseFloat(cupoTotal)) {
      return res.status(400).json({ message: "El saldo usado no puede superar el cupo total" })
    }

    const tarjeta = await prisma.tarjetaCredito.create({
      data: {
        banco: banco.trim(),
        nombreTarjeta: nombreTarjeta.trim(),
        franquicia,
        cupoTotal: parseFloat(cupoTotal),
        saldoUsado: parseFloat(saldoUsado),
        pagoMinimo: pagoMinimo != null ? parseFloat(pagoMinimo) : null,
        fechaCorte: parseInt(fechaCorte),
        fechaPago: parseInt(fechaPago),
        tasaInteres: tasaInteres != null ? parseFloat(tasaInteres) : null,
        estado: estado || "ACTIVA",
        descripcion: descripcion?.trim() || null,
        userId: req.user.id
      }
    })

    res.status(201).json({ message: "Tarjeta creada correctamente", tarjeta: addDisponible(tarjeta) })
  } catch (error) {
    next(error)
  }
}

const obtenerTarjetas = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query)
    const where = { userId: req.user.id }
    if (req.query.estado) where.estado = req.query.estado

    const [tarjetas, total] = await Promise.all([
      prisma.tarjetaCredito.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.tarjetaCredito.count({ where })
    ])

    res.json(paginatedResponse(tarjetas.map(addDisponible), total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerTarjetaPorId = async (req, res, next) => {
  try {
    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { pagos: { orderBy: { fechaPago: "desc" }, take: 5 } }
    })
    if (!tarjeta) return res.status(404).json({ message: "Tarjeta no encontrada" })
    res.json(addDisponible(tarjeta))
  } catch (error) {
    next(error)
  }
}

const actualizarTarjeta = async (req, res, next) => {
  try {
    const { id } = req.params
    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!tarjeta) return res.status(404).json({ message: "Tarjeta no encontrada" })

    const { banco, nombreTarjeta, franquicia, cupoTotal, saldoUsado, pagoMinimo, fechaCorte, fechaPago, tasaInteres, estado, descripcion } = req.body

    const nuevoCupo = cupoTotal != null ? parseFloat(cupoTotal) : Number(tarjeta.cupoTotal)
    const nuevoSaldo = saldoUsado != null ? parseFloat(saldoUsado) : Number(tarjeta.saldoUsado)

    if (nuevoSaldo > nuevoCupo) {
      return res.status(400).json({ message: "El saldo usado no puede superar el cupo total" })
    }

    const actualizada = await prisma.tarjetaCredito.update({
      where: { id: parseInt(id) },
      data: {
        ...(banco !== undefined && { banco: banco.trim() }),
        ...(nombreTarjeta !== undefined && { nombreTarjeta: nombreTarjeta.trim() }),
        ...(franquicia !== undefined && { franquicia }),
        ...(cupoTotal !== undefined && { cupoTotal: nuevoCupo }),
        ...(saldoUsado !== undefined && { saldoUsado: nuevoSaldo }),
        ...(pagoMinimo !== undefined && { pagoMinimo: pagoMinimo != null ? parseFloat(pagoMinimo) : null }),
        ...(fechaCorte !== undefined && { fechaCorte: parseInt(fechaCorte) }),
        ...(fechaPago !== undefined && { fechaPago: parseInt(fechaPago) }),
        ...(tasaInteres !== undefined && { tasaInteres: tasaInteres != null ? parseFloat(tasaInteres) : null }),
        ...(estado !== undefined && { estado }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null })
      }
    })

    res.json({ message: "Tarjeta actualizada correctamente", tarjeta: addDisponible(actualizada) })
  } catch (error) {
    next(error)
  }
}

const eliminarTarjeta = async (req, res, next) => {
  try {
    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!tarjeta) return res.status(404).json({ message: "Tarjeta no encontrada" })

    await prisma.$transaction([
      prisma.pago.deleteMany({ where: { tarjetaId: parseInt(req.params.id) } }),
      prisma.tarjetaCredito.delete({ where: { id: parseInt(req.params.id) } })
    ])

    res.json({ message: "Tarjeta eliminada correctamente" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  tarjetaValidation,
  crearTarjeta,
  obtenerTarjetas,
  obtenerTarjetaPorId,
  actualizarTarjeta,
  eliminarTarjeta
}
