const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const agregarDisponible = (tarjeta) => {
  return {
    ...tarjeta,
    disponible: Number(tarjeta.cupoTotal) - Number(tarjeta.saldoUsado)
  }
}

const crearTarjeta = async (req, res) => {
  try {
    const {
      banco,
      nombreTarjeta,
      franquicia,
      cupoTotal,
      saldoUsado,
      pagoMinimo,
      fechaCorte,
      fechaPago,
      tasaInteres,
      estado,
      descripcion
    } = req.body

    if (!banco || !nombreTarjeta || !franquicia || !cupoTotal || saldoUsado === undefined || !fechaCorte || !fechaPago) {
      return res.status(400).json({
        message: "banco, nombreTarjeta, franquicia, cupoTotal, saldoUsado, fechaCorte y fechaPago son obligatorios"
      })
    }

    const tarjeta = await prisma.tarjetaCredito.create({
      data: {
        banco,
        nombreTarjeta,
        franquicia,
        cupoTotal,
        saldoUsado,
        pagoMinimo,
        fechaCorte,
        fechaPago,
        tasaInteres,
        estado: estado || "ACTIVA",
        descripcion,
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: "Tarjeta creada correctamente",
      tarjeta: agregarDisponible(tarjeta)
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear tarjeta"
    })
  }
}

const obtenerTarjetas = async (req, res) => {
  try {
    const tarjetas = await prisma.tarjetaCredito.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(tarjetas.map(agregarDisponible))
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener tarjetas"
    })
  }
}

const obtenerTarjetaPorId = async (req, res) => {
  try {
    const { id } = req.params

    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!tarjeta) {
      return res.status(404).json({
        message: "Tarjeta no encontrada"
      })
    }

    res.json(agregarDisponible(tarjeta))
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener tarjeta"
    })
  }
}

const actualizarTarjeta = async (req, res) => {
  try {
    const { id } = req.params

    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!tarjeta) {
      return res.status(404).json({
        message: "Tarjeta no encontrada"
      })
    }

    const {
      banco,
      nombreTarjeta,
      franquicia,
      cupoTotal,
      saldoUsado,
      pagoMinimo,
      fechaCorte,
      fechaPago,
      tasaInteres,
      estado,
      descripcion
    } = req.body

    const actualizada = await prisma.tarjetaCredito.update({
      where: {
        id: parseInt(id)
      },
      data: {
        banco,
        nombreTarjeta,
        franquicia,
        cupoTotal,
        saldoUsado,
        pagoMinimo,
        fechaCorte,
        fechaPago,
        tasaInteres,
        estado,
        descripcion
      }
    })

    res.json({
      message: "Tarjeta actualizada correctamente",
      tarjeta: agregarDisponible(actualizada)
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar tarjeta"
    })
  }
}

const eliminarTarjeta = async (req, res) => {
  try {
    const { id } = req.params

    const tarjeta = await prisma.tarjetaCredito.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!tarjeta) {
      return res.status(404).json({
        message: "Tarjeta no encontrada"
      })
    }

    await prisma.tarjetaCredito.delete({
      where: {
        id: parseInt(id)
      }
    })

    res.json({
      message: "Tarjeta eliminada correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar tarjeta"
    })
  }
}

module.exports = {
  crearTarjeta,
  obtenerTarjetas,
  obtenerTarjetaPorId,
  actualizarTarjeta,
  eliminarTarjeta
}