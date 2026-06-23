const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const { rateLimit } = require("express-rate-limit")

const authRoutes = require("./modules/auth/auth.routes")
const ingresosRoutes = require("./modules/ingresos/ingresos.routes")
const gastosRoutes = require("./modules/gastos/gastos.routes")
const deudasRoutes = require("./modules/deudas/deudas.routes")
const tarjetasRoutes = require("./modules/tarjetas/tarjetas.routes")
const pagosRoutes = require("./modules/pagos/pagos.routes")
const amortizacionRoutes = require("./modules/amortizacion/amortizacion.routes")
const reportesRoutes = require("./modules/reportes/reportes.routes")
const { errorHandler, notFound } = require("./middlewares/errorHandler")

const app = express()
app.set('trust proxy', 1)

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: [
    'https://finanzas-frontend-aohj.vercel.app',
    'https://finanzas-frontend-vqwf.vercel.app',
    /\.vercel\.app$/,
    '*'
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes, intenta más tarde" }
}))

// Rate limiting estricto para auth
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Demasiados intentos de autenticación" }
}))

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes)
app.use("/api/ingresos", ingresosRoutes)
app.use("/api/gastos", gastosRoutes)
app.use("/api/deudas", deudasRoutes)
app.use("/api/tarjetas", tarjetasRoutes)
app.use("/api/pagos", pagosRoutes)
app.use("/api/amortizacion", amortizacionRoutes)
app.use("/api/reportes", reportesRoutes)

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

module.exports = app
