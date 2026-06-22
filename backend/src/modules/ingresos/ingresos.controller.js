const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse, parseDateFilter } = require("../../utils/pagination")

// ── Validaciones ─────────────────────────────────────────────────────────────

const ingresoValidation = [
  body("tipo").trim().notEmpty().withMessage("El tipo es obligatorio")
    .isLength({ max: 100 }).withMessage("Tipo máximo 100 caracteres"),
  body("monto").isFloat({ gt: 0 }).withMessage("El monto debe ser un número mayor a 0"),
  body("fecha").isISO8601().withMessage("Fecha inválida, usa formato ISO (YYYY-MM-DD)"),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 })
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const crearIngreso = async (req, res, next) => {
  try {
    const { tipo, monto, descripcion, fecha } = req.body

    const ingreso = await prisma.ingreso.create({
      data: {
        tipo: tipo.trim(),
        monto: parseFloat(monto),
        descripcion: descripcion?.trim() || null,
        fecha: new Date(fecha),
        userId: req.user.id
      }
    })

    res.status(201).json({ message: "Ingreso creado correctamente", ingreso })
  } catch (error) {
    next(error)
  }
}

const obtenerIngresos = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query)
    const userId = req.user.id

    const where = { userId }

    // Filtro por tipo
    if (req.query.tipo) {
      where.tipo = { contains: req.query.tipo.trim(), mode: "insensitive" }
    }

    // Filtro por fecha
    const fechaFilter = parseDateFilter(req.query)
    if (fechaFilter) where.fecha = fechaFilter

    const [ingresos, total] = await Promise.all([
      prisma.ingreso.findMany({
        where,
        orderBy: { fecha: "desc" },
        skip,
        take
      }),
      prisma.ingreso.count({ where })
    ])

    res.json(paginatedResponse(ingresos, total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerIngresoPorId = async (req, res, next) => {
  try {
    const ingreso = await prisma.ingreso.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!ingreso) return res.status(404).json({ message: "Ingreso no encontrado" })
    res.json(ingreso)
  } catch (error) {
    next(error)
  }
}

const actualizarIngreso = async (req, res, next) => {
  try {
    const { id } = req.params
    const { tipo, monto, descripcion, fecha } = req.body

    const ingreso = await prisma.ingreso.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!ingreso) return res.status(404).json({ message: "Ingreso no encontrado" })

    const actualizado = await prisma.ingreso.update({
      where: { id: parseInt(id) },
      data: {
        ...(tipo !== undefined && { tipo: tipo.trim() }),
        ...(monto !== undefined && { monto: parseFloat(monto) }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null }),
        ...(fecha !== undefined && { fecha: new Date(fecha) })
      }
    })

    res.json({ message: "Ingreso actualizado correctamente", ingreso: actualizado })
  } catch (error) {
    next(error)
  }
}

const eliminarIngreso = async (req, res, next) => {
  try {
    const ingreso = await prisma.ingreso.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!ingreso) return res.status(404).json({ message: "Ingreso no encontrado" })

    await prisma.ingreso.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: "Ingreso eliminado correctamente" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  ingresoValidation,
  crearIngreso,
  obtenerIngresos,
  obtenerIngresoPorId,
  actualizarIngreso,
  eliminarIngreso
}
