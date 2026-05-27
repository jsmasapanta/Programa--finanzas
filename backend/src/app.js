const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const authRoutes = require("./modules/auth/auth.routes")
const ingresosRoutes = require("./modules/ingresos/ingresos.routes")
const gastosRoutes = require("./modules/gastos/gastos.routes")
const deudasRoutes = require("./modules/deudas/deudas.routes")
const tarjetasRoutes = require("./modules/tarjetas/tarjetas.routes")
const pagosRoutes = require("./modules/pagos/pagos.routes")
const amortizacionRoutes = require("./modules/amortizacion/amortizacion.routes")
const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))

app.get("/health", (req, res) => {
  res.json({
    message: "Backend finanzas funcionando"
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/ingresos", ingresosRoutes)
app.use("/api/gastos", gastosRoutes)
app.use("/api/deudas", deudasRoutes)
app.use("/api/tarjetas", tarjetasRoutes)
app.use("/api/pagos", pagosRoutes)
app.use("/api/amortizacion", amortizacionRoutes)
module.exports = app