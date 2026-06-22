const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse } = require("../../utils/pagination")

const ESTADOS = ["PENDIENTE", "PAGADA", "VENCIDA"]

// ── Validaciones ─────────────────────────────────────────────────────────────

const cuotaValidation = [
  body("deudaId").isInt({ gt: 0 }).withMessage("deudaId inválido"),
  body("numeroCuota").isInt({ gt: 0 }).withMessage("numeroCuota debe ser mayor a 0"),
  body("fechaPago").isISO8601().withMessage("fechaPago inválida"),
  body("cuota").isFloat({ gt: 0 }).withMessage("cuota debe ser mayor a 0"),
  body("capital").optional({ nullable: true }).isFloat({ min: 0 }),
  body("interes").optional({ nullable: true }).isFloat({ min: 0 }),
  body("seguro").optional({ nullable: true }).isFloat({ min: 0 }),
  body("saldoRestante").optional({ nullable: true }).isFloat({ min: 0 }),
  body("estado").optional().isIn(ESTADOS).withMessage(`Estado debe ser: ${ESTADOS.join(", ")}`),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 })
]

const cuotaUpdateValidation = [
  body("numeroCuota").optional().isInt({ gt: 0 }),
  body("fechaPago").optional().isISO8601().withMessage("fechaPago inválida"),
  body("cuota").optional().isFloat({ gt: 0 }),
  body("capital").optional({ nullable: true }).isFloat({ min: 0 }),
  body("interes").optional({ nullable: true }).isFloat({ min: 0 }),
  body("seguro").optional({ nullable: true }).isFloat({ min: 0 }),
  body("saldoRestante").optional({ nullable: true }).isFloat({ min: 0 }),
  body("estado").optional().isIn(ESTADOS),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 })
]

// ── Generador automático de tabla de amortización ─────────────────────────────

const generarTablaAmortizacion = async (req, res, next) => {
  try {
    const { deudaId } = req.params

    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(deudaId), userId: req.user.id }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

    if (!deuda.tasaInteres || !deuda.cuotaMensual || !deuda.fechaInicio) {
      return res.status(400).json({
        message: "La deuda necesita tasaInteres, cuotaMensual y fechaInicio para generar la tabla"
      })
    }

    const tasaMensual = Number(deuda.tasaInteres) / 100 / 12
    let saldo = Number(deuda.saldoActual)
    const cuota = Number(deuda.cuotaMensual)
    const fechaBase = new Date(deuda.fechaInicio)
    const diaOrigen = fechaBase.getDate()
    let fechaCuota = new Date(fechaBase)
    const cuotas = []
    let numeroCuota = 1
    const MAX_CUOTAS = 600 // 50 años máximo

    // Suma un mes preservando el día original sin overflow (ej: 31 ene → 28 feb, no 2 mar)
    const sumarMes = (fecha) => {
      const d = new Date(fecha)
      d.setDate(1)
      d.setMonth(d.getMonth() + 1)
      const maxDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
      d.setDate(Math.min(diaOrigen, maxDia))
      return d
    }

    while (saldo > 0.01 && numeroCuota <= MAX_CUOTAS) {
      const interes = saldo * tasaMensual
      const capital = Math.min(cuota - interes, saldo)
      saldo = Math.max(0, saldo - capital)

      fechaCuota = sumarMes(fechaCuota)

      cuotas.push({
        deudaId: parseInt(deudaId),
        numeroCuota: numeroCuota++,
        fechaPago: new Date(fechaCuota),
        cuota: parseFloat(cuota.toFixed(2)),
        capital: parseFloat(capital.toFixed(2)),
        interes: parseFloat(interes.toFixed(2)),
        saldoRestante: parseFloat(saldo.toFixed(2)),
        estado: "PENDIENTE"
      })
    }

    // Reemplazar cuotas existentes
    await prisma.$transaction([
      prisma.amortizacion.deleteMany({ where: { deudaId: parseInt(deudaId) } }),
      prisma.amortizacion.createMany({ data: cuotas })
    ])

    res.status(201).json({
      message: `Tabla de amortización generada con ${cuotas.length} cuotas`,
      totalCuotas: cuotas.length
    })
  } catch (error) {
    next(error)
  }
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

const crearCuota = async (req, res, next) => {
  try {
    const { deudaId, numeroCuota, fechaPago, cuota, capital, interes, seguro, saldoRestante, estado, descripcion } = req.body

    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(deudaId), userId: req.user.id }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

    const amortizacion = await prisma.amortizacion.create({
      data: {
        deudaId: parseInt(deudaId),
        numeroCuota: parseInt(numeroCuota),
        fechaPago: new Date(fechaPago),
        cuota: parseFloat(cuota),
        capital: capital != null ? parseFloat(capital) : null,
        interes: interes != null ? parseFloat(interes) : null,
        seguro: seguro != null ? parseFloat(seguro) : null,
        saldoRestante: saldoRestante != null ? parseFloat(saldoRestante) : null,
        estado: estado || "PENDIENTE",
        descripcion: descripcion?.trim() || null
      }
    })

    res.status(201).json({ message: "Cuota creada correctamente", amortizacion })
  } catch (error) {
    next(error)
  }
}

const obtenerAmortizacionesPorDeuda = async (req, res, next) => {
  try {
    const { deudaId } = req.params
    const { skip, take, page, limit } = parsePagination(req.query)

    const deuda = await prisma.deuda.findFirst({
      where: { id: parseInt(deudaId), userId: req.user.id }
    })
    if (!deuda) return res.status(404).json({ message: "Deuda no encontrada" })

    const where = { deudaId: parseInt(deudaId) }
    if (req.query.estado) where.estado = req.query.estado

    const [cuotas, total] = await Promise.all([
      prisma.amortizacion.findMany({ where, orderBy: { numeroCuota: "asc" }, skip, take }),
      prisma.amortizacion.count({ where })
    ])

    res.json(paginatedResponse(cuotas, total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerCuotaPorId = async (req, res, next) => {
  try {
    const cuota = await prisma.amortizacion.findFirst({
      where: { id: parseInt(req.params.id), deuda: { userId: req.user.id } },
      include: { deuda: { select: { entidad: true, tipo: true } } }
    })
    if (!cuota) return res.status(404).json({ message: "Cuota no encontrada" })
    res.json(cuota)
  } catch (error) {
    next(error)
  }
}

const actualizarCuota = async (req, res, next) => {
  try {
    const cuota = await prisma.amortizacion.findFirst({
      where: { id: parseInt(req.params.id), deuda: { userId: req.user.id } }
    })
    if (!cuota) return res.status(404).json({ message: "Cuota no encontrada" })

    const { numeroCuota, fechaPago, cuota: cuotaMonto, capital, interes, seguro, saldoRestante, estado, descripcion } = req.body

    const actualizada = await prisma.amortizacion.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(numeroCuota !== undefined && { numeroCuota: parseInt(numeroCuota) }),
        ...(fechaPago !== undefined && { fechaPago: new Date(fechaPago) }),
        ...(cuotaMonto !== undefined && { cuota: parseFloat(cuotaMonto) }),
        ...(capital !== undefined && { capital: capital != null ? parseFloat(capital) : null }),
        ...(interes !== undefined && { interes: interes != null ? parseFloat(interes) : null }),
        ...(seguro !== undefined && { seguro: seguro != null ? parseFloat(seguro) : null }),
        ...(saldoRestante !== undefined && { saldoRestante: saldoRestante != null ? parseFloat(saldoRestante) : null }),
        ...(estado !== undefined && { estado }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null })
      }
    })

    res.json({ message: "Cuota actualizada correctamente", cuota: actualizada })
  } catch (error) {
    next(error)
  }
}

const eliminarCuota = async (req, res, next) => {
  try {
    const cuota = await prisma.amortizacion.findFirst({
      where: { id: parseInt(req.params.id), deuda: { userId: req.user.id } }
    })
    if (!cuota) return res.status(404).json({ message: "Cuota no encontrada" })

    await prisma.amortizacion.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: "Cuota eliminada correctamente" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  cuotaValidation, cuotaUpdateValidation,
  generarTablaAmortizacion,
  crearCuota,
  obtenerAmortizacionesPorDeuda,
  obtenerCuotaPorId,
  actualizarCuota,
  eliminarCuota
}
