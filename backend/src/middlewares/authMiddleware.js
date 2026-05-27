const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const env = require("../config/env")

const prisma = new PrismaClient()

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: "Token no enviado" })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Token inválido" })
    }

    const decoded = jwt.verify(token, env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        moneda: true,
        salarioMensual: true,
        alertasActivas: true
      }
    })

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" })
    }

    req.user = user

    next()
  } catch (error) {
    res.status(401).json({ message: "Token no autorizado" })
  }
}

module.exports = authMiddleware