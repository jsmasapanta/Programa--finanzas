const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const crearPago = async (req, res) => {
  try {
    const { tipo, monto, fechaPago, descripcion, deudaId, tarjetaId } = req.body

    if (!tipo || !monto || !fechaPago) {
      return res.status(400).json({
        message: "tipo, monto y fechaPago son obligatorios"
      })
    }

    if (tipo !== "DEUDA" && tipo !== "TARJETA") {
      return res.status(400).json({
        message: "tipo debe ser DEUDA o TARJETA"
      })
    }

    if (tipo === "DEUDA" && !deudaId) {
      return res.status(400).json({
        message: "deudaId es obligatorio para pagos de deuda"
      })
    }

    if (tipo === "TARJETA" && !tarjetaId) {
      return res.status(400).json({
        message: "tarjetaId es obligatorio para pagos de tarjeta"
      })
    }

    if (deudaId && tarjetaId) {
      return res.status(400).json({
        message: "El pago no puede tener deudaId y tarjetaId al mismo tiempo"
      })
    }

    const montoPago = Number(monto)

    if (montoPago <= 0) {
      return res.status(400).json({
        message: "El monto debe ser mayor a cero"
      })
    }

    let pago

    if (tipo === "DEUDA") {
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

      const nuevoSaldo = Number(deuda.saldoActual) - montoPago
      const saldoFinal = nuevoSaldo < 0 ? 0 : nuevoSaldo
      const nuevoEstado = saldoFinal === 0 ? "PAGADA" : deuda.estado

      pago = await prisma.$transaction(async (tx) => {
        const pagoCreado = await tx.pago.create({
          data: {
            tipo,
            monto,
            fechaPago: new Date(fechaPago),
            descripcion,
            deudaId: deuda.id,
            userId: req.user.id
          }
        })

        const deudaActualizada = await tx.deuda.update({
          where: {
            id: deuda.id
          },
          data: {
            saldoActual: saldoFinal,
            estado: nuevoEstado
          }
        })

        return {
          pago: pagoCreado,
          deuda: deudaActualizada
        }
      })

      return res.status(201).json({
        message: "Pago de deuda registrado correctamente",
        ...pago
      })
    }

    if (tipo === "TARJETA") {
      const tarjeta = await prisma.tarjetaCredito.findFirst({
        where: {
          id: parseInt(tarjetaId),
          userId: req.user.id
        }
      })

      if (!tarjeta) {
        return res.status(404).json({
          message: "Tarjeta no encontrada"
        })
      }

      const nuevoSaldo = Number(tarjeta.saldoUsado) - montoPago
      const saldoFinal = nuevoSaldo < 0 ? 0 : nuevoSaldo

      pago = await prisma.$transaction(async (tx) => {
        const pagoCreado = await tx.pago.create({
          data: {
            tipo,
            monto,
            fechaPago: new Date(fechaPago),
            descripcion,
            tarjetaId: tarjeta.id,
            userId: req.user.id
          }
        })

        const tarjetaActualizada = await tx.tarjetaCredito.update({
          where: {
            id: tarjeta.id
          },
          data: {
            saldoUsado: saldoFinal
          }
        })

        return {
          pago: pagoCreado,
          tarjeta: {
            ...tarjetaActualizada,
            disponible: Number(tarjetaActualizada.cupoTotal) - Number(tarjetaActualizada.saldoUsado)
          }
        }
      })

      return res.status(201).json({
        message: "Pago de tarjeta registrado correctamente",
        ...pago
      })
    }
  } catch (error) {
    res.status(500).json({
      message: "Error al registrar pago"
    })
  }
}

const obtenerPagos = async (req, res) => {
  try {
    const pagos = await prisma.pago.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        deuda: true,
        tarjeta: true
      },
      orderBy: {
        fechaPago: "desc"
      }
    })

    res.json(pagos)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pagos"
    })
  }
}

const obtenerPagoPorId = async (req, res) => {
  try {
    const { id } = req.params

    const pago = await prisma.pago.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      include: {
        deuda: true,
        tarjeta: true
      }
    })

    if (!pago) {
      return res.status(404).json({
        message: "Pago no encontrado"
      })
    }

    res.json(pago)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pago"
    })
  }
}

module.exports = {
  crearPago,
  obtenerPagos,
  obtenerPagoPorId
}