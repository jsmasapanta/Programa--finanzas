const app = require("./app")
const pool = require("./config/db")
const env = require("./config/env")

const startServer = async () => {
  try {
    await pool.query("SELECT NOW()")

    console.log("PostgreSQL conectado")

    app.listen(env.PORT, () => {
      console.log(`Servidor corriendo en puerto ${env.PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}

startServer()