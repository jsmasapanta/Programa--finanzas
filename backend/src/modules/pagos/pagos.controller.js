const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse, parseDateFilter } = require("../../utils/pagination")

// ── Validaciones ─────────────────────────────────────────────────────────────

const pagoValidation = [
  body("tipo").isIn(["DEUDA", "TARJETA"]).withMessage("tipo debe ser DEUDA o TARJETA"),
  body("monto").isFloat({ gt: 0 }).withMessage("El monto debe ser mayor a 0"),
  body("fechaPago").isISO8601().withMessage("fechaPago inválida"),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("deudaId").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("deudaId inválido"),
  body("tarjetaId").optional({ nullable: true }).isInt({ gt: 0 }).withMessage("tarjetaId inválido")
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const crearPago = async (req, res, next) => {
  try {
    const { tipo, monto, fechaPago, descripcion, deudaId, tarjetaId } = req.body
    const montoPago = parseFloat(monto)
    const userId = req.user.id

    if (tipo === "DEUDA" && !deudaId) {
      return res.status(400).json({ message: "deudaId es obligatorio para pagos de tipo DEUDA" })
    }
    if (tipo === "TARJETA" && !tarjetaId) {
      return res.status(400).json({ message: "tarjetaId es obligatorio para pagos de tipo TARJETA" })
    }
    if (deudaId && tarjetaId) {
      return res.status(400).json({ message: "Un pago no puede tener deudaId y tarjetaId a la vez" })
    }

    if (tipo === "DEUDA") {
      const deuda = await prisma.deuda.findFirst({
        where: { id: parseInt(deudaId), userId }
      })
      if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

      const saldoFinal = Math.max(0, Number(deuda.saldoActual) - montoPago)
      const nuevoEstado = saldoFinal === 0 ? "PAGADA" : deuda.estado

      const result = await prisma.$transaction(async (tx) => {
        const pago = await tx.pago.create({
          data: {
            tipo, monto: montoPago,
            fechaPago: new Date(fechaPago),
            descripcion: descripcion?.trim() || null,
            deudaId: deuda.id, userId
          }
        })
        const deudaActualizada = await tx.deuda.update({
          where: { id: deuda.id },
          data: { saldoActual: saldoFinal, estado: nuevoEstado }
        })
        return { pago, deuda: deudaActualizada }
      })

      return res.status(201).json({ message: "Pago de deuda registrado correctamente", ...result })
    }

    if (tipo === "TARJETA") {
      const tarjeta = await prisma.tarjetaCredito.findFirst({
        where: { id: parseInt(tarjetaId), userId }
      })
      if (!tarjeta) return res.status(404).json({ message: "Tarjeta no encontrada" })

      const saldoFinal = Math.max(0, Number(tarjeta.saldoUsado) - montoPago)

      const result = await prisma.$transaction(async (tx) => {
        const pago = await tx.pago.create({
          data: {
            tipo, monto: montoPago,
            fechaPago: new Date(fechaPago),
            descripcion: descripcion?.trim() || null,
            tarjetaId: tarjeta.id, userId
          }
        })
        const tarjetaActualizada = await tx.tarjetaCredito.update({
          where: { id: tarjeta.id },
          data: { saldoUsado: saldoFinal }
        })
        return {
          pago,
          tarjeta: {
            ...tarjetaActualizada,
            disponible: Number(tarjetaActualizada.cupoTotal) - Number(tarjetaActualizada.saldoUsado)
          }
        }
      })

      return res.status(201).json({ message: "Pago de tarjeta registrado correctamente", ...result })
    }
  } catch (error) {
    next(error)
  }
}

const obtenerPagos = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query)
    const userId = req.user.id
    const where = { userId }

    if (req.query.tipo) where.tipo = req.query.tipo

    const fechaFilter = parseDateFilter(req.query)
    if (fechaFilter) where.fechaPago = fechaFilter

    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
        where,
        include: { deuda: true, tarjeta: true },
        orderBy: { fechaPago: "desc" },
        skip, take
      }),
      prisma.pago.count({ where })
    ])

    res.json(paginatedResponse(pagos, total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerPagoPorId = async (req, res, next) => {
  try {
    const pago = await prisma.pago.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { deuda: true, tarjeta: true }
    })
    if (!pago) return res.status(404).json({ message: "Pago no encontrado" })
    res.json(pago)
  } catch (error) {
    next(error)
  }
}

module.exports = { pagoValidation, crearPago, obtenerPagos, obtenerPagoPorId }
