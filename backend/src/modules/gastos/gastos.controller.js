const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const crearGasto = async (req, res) => {
  try {
    const { categoria, subcategoria, monto, descripcion, fecha, esRecurrente } = req.body

    if (!categoria || !monto || !fecha) {
      return res.status(400).json({
        message: "categoria, monto y fecha son obligatorios"
      })
    }

    const gasto = await prisma.gasto.create({
      data: {
        categoria,
        subcategoria,
        monto,
        descripcion,
        fecha: new Date(fecha),
        esRecurrente: esRecurrente || false,
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: "Gasto creado correctamente",
      gasto
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear gasto"
    })
  }
}

const obtenerGastos = async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        fecha: "desc"
      }
    })

    res.json(gastos)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener gastos"
    })
  }
}

const actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria, subcategoria, monto, descripcion, fecha, esRecurrente } = req.body

    const gasto = await prisma.gasto.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!gasto) {
      return res.status(404).json({
        message: "Gasto no encontrado"
      })
    }

    const actualizado = await prisma.gasto.update({
      where: {
        id: parseInt(id)
      },
      data: {
        categoria,
        subcategoria,
        monto,
        descripcion,
        fecha: fecha ? new Date(fecha) : gasto.fecha,
        esRecurrente
      }
    })

    res.json({
      message: "Gasto actualizado correctamente",
      gasto: actualizado
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar gasto"
    })
  }
}

const eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params

    const gasto = await prisma.gasto.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!gasto) {
      return res.status(404).json({
        message: "Gasto no encontrado"
      })
    }

    await prisma.gasto.delete({
      where: {
        id: parseInt(id)
      }
    })

    res.json({
      message: "Gasto eliminado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar gasto"
    })
  }
}

module.exports = {
  crearGasto,
  obtenerGastos,
  actualizarGasto,
  eliminarGasto
}