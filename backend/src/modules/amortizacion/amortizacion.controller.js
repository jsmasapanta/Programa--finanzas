const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const crearCuota = async (req, res) => {
  try {
    const {
      deudaId,
      numeroCuota,
      fechaPago,
      cuota,
      capital,
      interes,
      seguro,
      saldoRestante,
      estado,
      descripcion
    } = req.body

    if (!deudaId || !numeroCuota || !fechaPago || !cuota) {
      return res.status(400).json({
        message: "deudaId, numeroCuota, fechaPago y cuota son obligatorios"
      })
    }

    const deuda = await prisma.deuda.findFirst({
      where: {
        id: parseInt(deudaId),
        userId: req.user.id
      }
    })

    if (!deuda) {
      return res.status(404).json({
        message: "Deuda no encontrada"
      })
    }

    const amortizacion = await prisma.amortizacion.create({
      data: {
        deudaId: parseInt(deudaId),
        numeroCuota,
        fechaPago: new Date(fechaPago),
        cuota,
        capital,
        interes,
        seguro,
        saldoRestante,
        estado: estado || "PENDIENTE",
        descripcion
      }
    })

    res.status(201).json({
      message: "Cuota de amortización creada correctamente",
      amortizacion
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear amortización"
    })
  }
}

const obtenerAmortizacionesPorDeuda = async (req, res) => {
  try {
    const { deudaId } = req.params

    const deuda = await prisma.deuda.findFirst({
      where: {
        id: parseInt(deudaId),
        userId: req.user.id
      }
    })

    if (!deuda) {
      return res.status(404).json({
        message: "Deuda no encontrada"
      })
    }

    const cuotas = await prisma.amortizacion.findMany({
      where: {
        deudaId: parseInt(deudaId)
      },
      orderBy: {
        numeroCuota: "asc"
      }
    })

    res.json(cuotas)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener amortizaciones"
    })
  }
}

const obtenerCuotaPorId = async (req, res) => {
  try {
    const { id } = req.params

    const cuota = await prisma.amortizacion.findFirst({
      where: {
        id: parseInt(id),
        deuda: {
          userId: req.user.id
        }
      }
    })

    if (!cuota) {
      return res.status(404).json({
        message: "Cuota no encontrada"
      })
    }

    res.json(cuota)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener cuota"
    })
  }
}

const actualizarCuota = async (req, res) => {
  try {
    const { id } = req.params

    const cuota = await prisma.amortizacion.findFirst({
      where: {
        id: parseInt(id),
        deuda: {
          userId: req.user.id
        }
      }
    })

    if (!cuota) {
      return res.status(404).json({
        message: "Cuota no encontrada"
      })
    }

    const {
      numeroCuota,
      fechaPago,
      cuotaMonto,
      capital,
      interes,
      seguro,
      saldoRestante,
      estado,
      descripcion
    } = req.body

    const actualizada = await prisma.amortizacion.update({
      where: {
        id: parseInt(id)
      },
      data: {
        numeroCuota,
        fechaPago: fechaPago ? new Date(fechaPago) : cuota.fechaPago,
        cuota: cuotaMonto,
        capital,
        interes,
        seguro,
        saldoRestante,
        estado,
        descripcion
      }
    })

    res.json({
      message: "Cuota actualizada correctamente",
      cuota: actualizada
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar cuota"
    })
  }
}

const eliminarCuota = async (req, res) => {
  try {
    const { id } = req.params

    const cuota = await prisma.amortizacion.findFirst({
      where: {
        id: parseInt(id),
        deuda: {
          userId: req.user.id
        }
      }
    })

    if (!cuota) {
      return res.status(404).json({
        message: "Cuota no encontrada"
      })
    }

    await prisma.amortizacion.delete({
      where: {
        id: parseInt(id)
      }
    })

    res.json({
      message: "Cuota eliminada correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar cuota"
    })
  }
}

module.exports = {
  crearCuota,
  obtenerAmortizacionesPorDeuda,
  obtenerCuotaPorId,
  actualizarCuota,
  eliminarCuota
}