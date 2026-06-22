const app = require("./app")
const prisma = require("./config/prisma")
const env = require("./config/env")

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$connect()
    console.log("✅ PostgreSQL conectado")

    const server = app.listen(env.PORT, '0.0.0.0', ()=> {
      console.log(`🚀 Servidor corriendo en puerto ${env.PORT} [${env.NODE_ENV}]`)
    })

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚡ ${signal} recibido. Cerrando servidor...`)
      server.close(async () => {
        await prisma.$disconnect()
        console.log("🔌 Conexión a base de datos cerrada")
        process.exit(0)
      })
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("SIGINT", () => shutdown("SIGINT"))
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

startServer()
