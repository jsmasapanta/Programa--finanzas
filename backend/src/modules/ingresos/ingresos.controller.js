const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const crearIngreso = async (req, res) => {
  try {
    const { tipo, monto, descripcion, fecha } = req.body

    if (!tipo || !monto || !fecha) {
      return res.status(400).json({
        message: "tipo, monto y fecha son obligatorios"
      })
    }

    const ingreso = await prisma.ingreso.create({
      data: {
        tipo,
        monto,
        descripcion,
        fecha: new Date(fecha),
        userId: req.user.id
      }
    })

    res.status(201).json({
      message: "Ingreso creado correctamente",
      ingreso
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al crear ingreso"
    })
  }
}

const obtenerIngresos = async (req, res) => {
  try {
    const ingresos = await prisma.ingreso.findMany({
      where: {
        userId: req.user.id
      },
      orderBy: {
        fecha: "desc"
      }
    })

    res.json(ingresos)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ingresos"
    })
  }
}

const actualizarIngreso = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, monto, descripcion, fecha } = req.body

    const ingreso = await prisma.ingreso.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!ingreso) {
      return res.status(404).json({
        message: "Ingreso no encontrado"
      })
    }

    const actualizado = await prisma.ingreso.update({
      where: {
        id: parseInt(id)
      },
      data: {
        tipo,
        monto,
        descripcion,
        fecha: fecha ? new Date(fecha) : ingreso.fecha
      }
    })

    res.json({
      message: "Ingreso actualizado correctamente",
      ingreso: actualizado
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar ingreso"
    })
  }
}

const eliminarIngreso = async (req, res) => {
  try {
    const { id } = req.params

    const ingreso = await prisma.ingreso.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    })

    if (!ingreso) {
      return res.status(404).json({
        message: "Ingreso no encontrado"
      })
    }

    await prisma.ingreso.delete({
      where: {
        id: parseInt(id)
      }
    })

    res.json({
      message: "Ingreso eliminado correctamente"
    })
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar ingreso"
    })
  }
}

module.exports = {
  crearIngreso,
  obtenerIngresos,
  actualizarIngreso,
  eliminarIngreso
}