const { verifyToken } = require("../utils/jwt")
const prisma = require("../config/prisma")

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no enviado o formato inválido" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

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
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" })
    }
    return res.status(401).json({ message: "Token inválido" })
  }
}

module.exports = authMiddleware
