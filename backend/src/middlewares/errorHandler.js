const env = require("../config/env")

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`)

  // Prisma errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "campo"
    return res.status(409).json({ message: `Ya existe un registro con ese ${field}` })
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Registro no encontrado" })
  }
  if (err.code === "P2003") {
    return res.status(400).json({ message: "Referencia inválida a un registro relacionado" })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token inválido o expirado" })
  }

  const status = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : "Error interno del servidor"

  res.status(status).json({
    message,
    ...(env.NODE_ENV === "development" && { stack: err.stack })
  })
}

const notFound = (req, res) => {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}

module.exports = { errorHandler, notFound }
