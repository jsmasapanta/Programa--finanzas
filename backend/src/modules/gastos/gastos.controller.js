const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { parsePagination, paginatedResponse, parseDateFilter } = require("../../utils/pagination")

// ── Validaciones ─────────────────────────────────────────────────────────────

const gastoValidation = [
  body("categoria").trim().notEmpty().withMessage("La categoría es obligatoria")
    .isLength({ max: 100 }),
  body("subcategoria").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("monto").isFloat({ gt: 0 }).withMessage("El monto debe ser mayor a 0"),
  body("fecha").isISO8601().withMessage("Fecha inválida"),
  body("descripcion").optional({ nullable: true }).trim().isLength({ max: 500 }),
  body("esRecurrente").optional().isBoolean().withMessage("esRecurrente debe ser true o false")
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const crearGasto = async (req, res, next) => {
  try {
    const { categoria, subcategoria, monto, descripcion, fecha, esRecurrente } = req.body

    const gasto = await prisma.gasto.create({
      data: {
        categoria: categoria.trim(),
        subcategoria: subcategoria?.trim() || null,
        monto: parseFloat(monto),
        descripcion: descripcion?.trim() || null,
        fecha: new Date(fecha),
        esRecurrente: Boolean(esRecurrente),
        userId: req.user.id
      }
    })

    res.status(201).json({ message: "Gasto creado correctamente", gasto })
  } catch (error) {
    next(error)
  }
}

const obtenerGastos = async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query)
    const userId = req.user.id
    const where = { userId }

    if (req.query.categoria) {
      where.categoria = { contains: req.query.categoria.trim(), mode: "insensitive" }
    }
    if (req.query.subcategoria) {
      where.subcategoria = { contains: req.query.subcategoria.trim(), mode: "insensitive" }
    }
    if (req.query.esRecurrente !== undefined) {
      where.esRecurrente = req.query.esRecurrente === "true"
    }

    const fechaFilter = parseDateFilter(req.query)
    if (fechaFilter) where.fecha = fechaFilter

    const [gastos, total] = await Promise.all([
      prisma.gasto.findMany({ where, orderBy: { fecha: "desc" }, skip, take }),
      prisma.gasto.count({ where })
    ])

    res.json(paginatedResponse(gastos, total, page, limit))
  } catch (error) {
    next(error)
  }
}

const obtenerGastoPorId = async (req, res, next) => {
  try {
    const gasto = await prisma.gasto.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!gasto) return res.status(404).json({ message: "Gasto no encontrado" })
    res.json(gasto)
  } catch (error) {
    next(error)
  }
}

const actualizarGasto = async (req, res, next) => {
  try {
    const { id } = req.params
    const { categoria, subcategoria, monto, descripcion, fecha, esRecurrente } = req.body

    const gasto = await prisma.gasto.findFirst({
      where: { id: parseInt(id), userId: req.user.id }
    })
    if (!gasto) return res.status(404).json({ message: "Gasto no encontrado" })

    const actualizado = await prisma.gasto.update({
      where: { id: parseInt(id) },
      data: {
        ...(categoria !== undefined && { categoria: categoria.trim() }),
        ...(subcategoria !== undefined && { subcategoria: subcategoria?.trim() || null }),
        ...(monto !== undefined && { monto: parseFloat(monto) }),
        ...(descripcion !== undefined && { descripcion: descripcion?.trim() || null }),
        ...(fecha !== undefined && { fecha: new Date(fecha) }),
        ...(esRecurrente !== undefined && { esRecurrente: Boolean(esRecurrente) })
      }
    })

    res.json({ message: "Gasto actualizado correctamente", gasto: actualizado })
  } catch (error) {
    next(error)
  }
}

const eliminarGasto = async (req, res, next) => {
  try {
    const gasto = await prisma.gasto.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id }
    })
    if (!gasto) return res.status(404).json({ message: "Gasto no encontrado" })

    await prisma.gasto.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: "Gasto eliminado correctamente" })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  gastoValidation,
  crearGasto,
  obtenerGastos,
  obtenerGastoPorId,
  actualizarGasto,
  eliminarGasto
}
