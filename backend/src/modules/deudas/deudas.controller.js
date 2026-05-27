const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const crearDeuda = async (req, res) => {
  try {
    const {
      entidad,
      tipo,
      montoOriginal,
      saldoActual,
      tasaInteres,
      cuotaMensual,
      fechaInicio,
      fechaFin,
      estado,
      descripcion
    } = req.body

    if (!entidad || !tipo || !montoOriginal || !saldoActual || !fechaInicio) {
      return res.status(400).json({
        message: "entidad, tipo, montoOriginal, saldoActual y fechaInicio son obligatorios"
      })
    }

    const deuda = await prisma.deuda.create({
      data: {
        entidad,
        tipo,
        montoOriginal,
        saldoActual,
        tasaInteres,
        cuotaMensual,
        fechaInicio: new Date(fechaInicio),
        fechaFin: fechaFin ? new Date(fechaFin) : null,
        estado: estado || "ACTIVA",
        descripcion,
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: "Deuda creada correctamente",
      deuda
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear deuda"
    })
  }
}

const obtenerDeudas = async (req, res) => {
  try {
    const deudas = await prisma.deuda.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(deudas)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener deudas"
    })
  }
}

const obtenerDeudaPorId = async (req, res) => {
  try {
    const { id } = req.params

    const deuda = await prisma.deuda.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!deuda) {
      return res.status(404).json({
        message: "Deuda no encontrada"
      })
    }

    res.json(deuda)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener deuda"
    })
  }
}

const actualizarDeuda = async (req, res) => {
  try {
    const { id } = req.params

    const deuda = await prisma.deuda.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!deuda) {
      return res.status(404).json({
        message: "Deuda no encontrada"
      })
    }

    const {
      entidad,
      tipo,
      montoOriginal,
      saldoActual,
      tasaInteres,
      cuotaMensual,
      fechaInicio,
      fechaFin,
      estado,
      descripcion
    } = req.body

    const actualizada = await prisma.deuda.update({
      where: {
        id: parseInt(id)
      },
      data: {
        entidad,
        tipo,
        montoOriginal,
        saldoActual,
        tasaInteres,
        cuotaMensual,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : deuda.fechaInicio,
        fechaFin: fechaFin ? new Date(fechaFin) : deuda.fechaFin,
        estado,
        descripcion
      }
    })

    res.json({
      message: "Deuda actualizada correctamente",
      deuda: actualizada
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar deuda"
    })
  }
}

const eliminarDeuda = async (req, res) => {
  try {
    const { id } = req.params

    const deuda = await prisma.deuda.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!deuda) {
      return res.status(404).json({
        message: "Deuda no encontrada"
      })
    }

    await prisma.deuda.delete({
      where: {
        id: parseInt(id)
      }
    })

    res.json({
      message: "Deuda eliminada correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar deuda"
    })
  }
}

module.exports = {
  crearDeuda,
  obtenerDeudas,
  obtenerDeudaPorId,
  actualizarDeuda,
  eliminarDeuda
}