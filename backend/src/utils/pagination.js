/**
 * Extrae parámetros de paginación de query string.
 * Uso: const { skip, take, page, limit } = parsePagination(req.query)
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20))
  const skip = (page - 1) * limit
  return { skip, take: limit, page, limit }
}

/**
 * Construye la respuesta paginada estándar.
 */
const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
})

/**
 * Extrae filtros de fecha del query string.
 * Acepta: fechaDesde, fechaHasta (ISO strings)
 */
const parseDateFilter = (query) => {
  const filter = {}
  if (query.fechaDesde) {
    const d = new Date(query.fechaDesde)
    if (isNaN(d)) {
      const err = new Error("fechaDesde inválida")
      err.status = 400
      throw err
    }
    filter.gte = d
  }
  if (query.fechaHasta) {
    const hasta = new Date(query.fechaHasta)
    if (isNaN(hasta)) {
      const err = new Error("fechaHasta inválida")
      err.status = 400
      throw err
    }
    hasta.setHours(23, 59, 59, 999)
    filter.lte = hasta
  }
  return Object.keys(filter).length ? filter : undefined
}

module.exports = { parsePagination, paginatedResponse, parseDateFilter }
