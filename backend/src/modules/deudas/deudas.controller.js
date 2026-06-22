const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse } = require("../../utils/pagination")

const ESTADOS_DEUDA = ["ACTIVA", "PAGADA", "EN_MORA", "REFINANCIADA"]
const TIPOS_DEUDA = ["CREDITO", "HIPOTECA", "VEHICULO", "PERSONAL", "TARJETA", "OTRO"]

// ── Validaciones ─────────────────────────────────────────────────────────────

const deudaValidation = [
  body("entidad").trim().notEmpty().withMessage("La entidad es obligatoria").isLength({ max: 100 }),
  body("tipo").trim().notEmpty().withMessage("El tipo es obligatorio")
    .isIn(TIPOS_DEUDA).withMessage(`Tipo debe ser uno de: ${TIPOS_DEUDA.join(", ")}`),
  body("montoOriginal").isFloat({ gt: 0 }).withMessage("montoOriginal debe ser mayor a 0"),
  body("saldoActual").isFloat({ min: 0 }).withMessage("saldoActual debe ser >= 0"),
  body("tasaInteres").optional({ nullable: true }).isFloat({ min: 0, max: 100 })
    .withMessage("Tasa de interés entre 0 y 100"),
  body("cuotaMensual").optional({ nullable: true }).isFloat({ min: 0 }),
  body("fechaInicio").isISO8601().withMessage("fechaInicio inválida"),
  body("fechaFin").optional({ nullable: true }).isISO8601().withMessage("fechaFin inválida"),
  body("estado").optional().isIn(ESTADOS_DEUDA)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_DEUDA.join(", ")}`),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 })
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const crearDeuda = async (req, res, next) => {
  try {
    const { entidad, tipo, montoOriginal, saldoActual, tasaInteres, cuotaMensual, fechaInicio, fechaFin, estado, descripcion } = req.body

    const deuda = await prisma.deuda.create({
      data: {
        entidad: entidad.trim(),
        tipo,
        montoOriginal: parseFloat(montoOriginal),
        saldoActual: parseFloat(saldoActual),
        tasaInteres: tasaInteres != null ? parseFloat(tasaInteres) : null,
        cuotaMensual: cuotaMensual != null ? parseFloat(cuotaMensual) : null,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || "ACTIVA",
        descripcion: descripcion?.trim() || null,
        userId: req.user.id
      }
    })

    res.status(201).json({ message: "Deuda creada correctamente", deuda })
  } catch (error) {
    next(error)
  }
}

const obtenerDeudas = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query)
    const userId = req.user.id
    const where = { userId }

    if (req.query.estado) where.estado = req.query.estado
    if (req.query.tipo) where.tipo = req.query.tipo

    const [deudas, total] = await Promise.all([
      prisma.deuda.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.deuda.count({ where })
    ])

    res.json(paginatedResponse(deudas, total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerDeudaPorId = async (req, res, next) => {
  try {
    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: {
        pagos: { orderBy: { fechaPago: "desc" }, take: 5 },
        amortizaciones: { orderBy: { numeroCuota: "asc" }, take: 12 }
      }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })
    res.json(deuda)
  } catch (error) {
    next(error)
  }
}

const actualizarDeuda = async (req, res, next) => {
  try {
    const { id } = req.params
    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

    const { entidad, tipo, montoOriginal, saldoActual, tasaInteres, cuotaMensual, fechaInicio, fechaFin, estado, descripcion } = req.body

    const actualizada = await prisma.deuda.update({
      where: { id: parseInt(id) },
      data: {
        ...(entidad !== undefined && { entidad: entidad.trim() }),
        ...(tipo !== undefined && { tipo }),
        ...(montoOriginal !== undefined && { montoOriginal: parseFloat(montoOriginal) }),
        ...(saldoActual !== undefined && { saldoActual: parseFloat(saldoActual) }),
        ...(tasaInteres !== undefined && { tasaInteres: tasaInteres != null ? parseFloat(tasaInteres) : null }),
        ...(cuotaMensual !== undefined && { cuotaMensual: cuotaMensual != null ? parseFloat(cuotaMensual) : null }),
        ...(fechaInicio !== undefined && { fechaInicio: new Date(fechaInicio) }),
        ...(fechaFin !== undefined && { fechaFin: fechaFin ? new Date(fechaFin) : null }),
        ...(estado !== undefined && { estado }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null })
      }
    })

    res.json({ message: "Deuda actualizada correctamente", deuda: actualizada })
  } catch (error) {
    next(error)
  }
}

const eliminarDeuda = async (req, res, next) => {
  try {
    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

    // Eliminar registros relacionados primero
    await prisma.$transaction([
      prisma.amortizacion.deleteMany({ where: { deudaId: parseInt(req.params.id) } }),
      prisma.pago.deleteMany({ where: { deudaId: parseInt(req.params.id) } }),
      prisma.deuda.delete({ where: { id: parseInt(req.params.id) } })
    ])

    res.json({ message: "Deuda eliminada correctamente" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  deudaValidation,
  crearDeuda,
  obtenerDeudas,
  obtenerDeudaPorId,
  actualizarDeuda,
  eliminarDeuda
}
