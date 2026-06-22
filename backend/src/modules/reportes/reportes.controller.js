const prisma = require("../../config/prisma")
const { parseDateFilter } = require("../../utils/pagination")

const sumar = (items, campo) =>
  items.reduce((acc, item) => acc + Number(item[campo] || 0), 0)

// GET /api/reportes/resumen
const obtenerResumen = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [ingAgg, gasAgg, deuAgg, tarAgg, pagAgg] = await Promise.all([
      prisma.ingreso.aggregate({ where: { userId }, _sum: { monto: true }, _count: true }),
      prisma.gasto.aggregate({ where: { userId }, _sum: { monto: true }, _count: true }),
      prisma.deuda.aggregate({ where: { userId }, _sum: { saldoActual: true }, _count: true }),
      prisma.tarjetaCredito.aggregate({ where: { userId }, _sum: { saldoUsado: true, cupoTotal: true }, _count: true }),
      prisma.pago.aggregate({ where: { userId }, _sum: { monto: true }, _count: true }),
    ])

    const totalIngresos = Number(ingAgg._sum.monto || 0)
    const totalGastos = Number(gasAgg._sum.monto || 0)
    const deudaTotal = Number(deuAgg._sum.saldoActual || 0)
    const saldoTarjetas = Number(tarAgg._sum.saldoUsado || 0)
    const cupoTotal = Number(tarAgg._sum.cupoTotal || 0)

    res.json({
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      deudaTotal,
      saldoTarjetas,
      cupoDisponibleTotal: cupoTotal - saldoTarjetas,
      pagosTotal: Number(pagAgg._sum.monto || 0),
      cantidades: {
        ingresos: ingAgg._count,
        gastos: gasAgg._count,
        deudas: deuAgg._count,
        tarjetas: tarAgg._count,
        pagos: pagAgg._count,
      }
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/reportes/gastos-categoria
const obtenerGastosPorCategoria = async (req, res, next) => {
  try {
    const userId = req.user.id
    const where = { userId }

    const fechaFilter = parseDateFilter(req.query)
    if (fechaFilter) where.fecha = fechaFilter

    const rows = await prisma.gasto.groupBy({
      by: ["categoria", "subcategoria"],
      where,
      _sum: { monto: true },
    })

    const agrupado = {}
    rows.forEach(({ categoria, subcategoria, _sum }) => {
      const monto = Number(_sum.monto || 0)
      if (!agrupado[categoria]) agrupado[categoria] = { total: 0, subcategorias: {} }
      agrupado[categoria].total += monto
      if (subcategoria) {
        agrupado[categoria].subcategorias[subcategoria] =
          (agrupado[categoria].subcategorias[subcategoria] || 0) + monto
      }
    })

    const totalGeneral = Object.values(agrupado).reduce((s, c) => s + c.total, 0)

    const data = Object.entries(agrupado)
      .map(([categoria, info]) => ({
        categoria,
        total: info.total,
        porcentaje: totalGeneral > 0 ? Math.round((info.total / totalGeneral) * 100) : 0,
        subcategorias: Object.entries(info.subcategorias).map(([sub, total]) => ({ subcategoria: sub, total }))
      }))
      .sort((a, b) => b.total - a.total)

    res.json({ totalGeneral, data })
  } catch (error) {
    next(error)
  }
}

// GET /api/reportes/ingresos-vs-gastos
const obtenerIngresosVsGastos = async (req, res, next) => {
  try {
    const userId = req.user.id
    const meses = parseInt(req.query.meses) || 6

    const desde = new Date()
    desde.setMonth(desde.getMonth() - meses + 1)
    desde.setDate(1)
    desde.setHours(0, 0, 0, 0)

    const [ingresos, gastos] = await Promise.all([
      prisma.ingreso.findMany({ where: { userId, fecha: { gte: desde } } }),
      prisma.gasto.findMany({ where: { userId, fecha: { gte: desde } } })
    ])

    const agruparPorMes = (items, campo) => {
      const mapa = {}
      items.forEach((item) => {
        const key = `${item.fecha.getFullYear()}-${String(item.fecha.getMonth() + 1).padStart(2, "0")}`
        mapa[key] = (mapa[key] || 0) + Number(item[campo])
      })
      return mapa
    }

    const ingMap = agruparPorMes(ingresos, "monto")
    const gasMap = agruparPorMes(gastos, "monto")

    const allKeys = new Set([...Object.keys(ingMap), ...Object.keys(gasMap)])
    const data = Array.from(allKeys)
      .sort()
      .map((mes) => ({
        mes,
        ingresos: ingMap[mes] || 0,
        gastos: gasMap[mes] || 0,
        balance: (ingMap[mes] || 0) - (gasMap[mes] || 0)
      }))

    res.json(data)
  } catch (error) {
    next(error)
  }
}

// GET /api/reportes/deudas
const obtenerResumenDeudas = async (req, res, next) => {
  try {
    const deudas = await prisma.deuda.findMany({
      where: { userId: req.user.id },
      orderBy: { saldoActual: "desc" }
    })

    const totalPendiente = sumar(deudas, "saldoActual")
    const totalOriginal = sumar(deudas, "montoOriginal")
    const porEstado = deudas.reduce((acc, d) => {
      acc[d.estado] = (acc[d.estado] || 0) + 1
      return acc
    }, {})

    res.json({
      totalPendiente,
      totalOriginal,
      porcentajePagado: totalOriginal > 0
        ? Math.round(((totalOriginal - totalPendiente) / totalOriginal) * 100)
        : 0,
      porEstado,
      cantidadDeudas: deudas.length,
      deudas
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/reportes/proximos-pagos
const obtenerProximosPagos = async (req, res, next) => {
  try {
    const userId = req.user.id
    const dias = parseInt(req.query.dias) || 30
    const hasta = new Date()
    hasta.setDate(hasta.getDate() + dias)

    const [cuotas, tarjetas] = await Promise.all([
      prisma.amortizacion.findMany({
        where: {
          estado: "PENDIENTE",
          fechaPago: { lte: hasta },
          deuda: { userId }
        },
        include: { deuda: { select: { entidad: true, tipo: true } } },
        orderBy: { fechaPago: "asc" },
        take: 20
      }),
      prisma.tarjetaCredito.findMany({
        where: { userId, estado: "ACTIVA" },
        orderBy: { fechaPago: "asc" }
      })
    ])

    res.json({
      cuotasPendientes: cuotas,
      tarjetasActivas: tarjetas.map((t) => ({
        ...t,
        disponible: Number(t.cupoTotal) - Number(t.saldoUsado)
      })),
      totalCuotas: sumar(cuotas, "cuota"),
      totalTarjetas: sumar(tarjetas, "pagoMinimo")
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/reportes/flujo-caja
const obtenerFlujoCaja = async (req, res, next) => {
  try {
    const userId = req.user.id
    const meses = parseInt(req.query.meses) || 3

    // Proyectar cuotas pendientes por mes
    const hasta = new Date()
    hasta.setMonth(hasta.getMonth() + meses)

    const cuotas = await prisma.amortizacion.findMany({
      where: {
        estado: "PENDIENTE",
        fechaPago: { lte: hasta },
        deuda: { userId }
      },
      orderBy: { fechaPago: "asc" }
    })

    const proyeccion = {}
    cuotas.forEach((c) => {
      const key = `${c.fechaPago.getFullYear()}-${String(c.fechaPago.getMonth() + 1).padStart(2, "0")}`
      if (!proyeccion[key]) proyeccion[key] = { mes: key, totalCuotas: 0, cantidadCuotas: 0 }
      proyeccion[key].totalCuotas += Number(c.cuota)
      proyeccion[key].cantidadCuotas++
    })

    res.json({
      proyeccionMensual: Object.values(proyeccion).sort((a, b) => a.mes.localeCompare(b.mes))
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  obtenerResumen,
  obtenerGastosPorCategoria,
  obtenerIngresosVsGastos,
  obtenerResumenDeudas,
  obtenerProximosPagos,
  obtenerFlujoCaja
}
