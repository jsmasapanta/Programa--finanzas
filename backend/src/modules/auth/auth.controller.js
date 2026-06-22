const { body } = require("express-validator")
const prisma = require("../../config/prisma")
const { hashPassword, comparePassword } = require("../../utils/password")
const { generateToken } = require("../../utils/jwt")

// ── Validaciones ────────────────────────────────────────────────────────────

const registerValidation = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ max: 100 }).withMessage("Nombre máximo 100 caracteres"),
  body("email").trim().isEmail().withMessage("Email inválido")
    .normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener mínimo 6 caracteres")
]

const loginValidation = [
  body("email").trim().isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("La contraseña es obligatoria")
]

const updateProfileValidation = [
  body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede estar vacío")
    .isLength({ max: 100 }),
  body("moneda").optional().isIn(["USD", "EUR", "COP", "MXN", "ARS", "CLP", "PEN", "BRL"])
    .withMessage("Moneda no válida"),
  body("salarioMensual").optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage("El salario debe ser un número positivo"),
  body("alertasActivas").optional().isBoolean().withMessage("alertasActivas debe ser true o false"),
  body("passwordActual").optional().isString(),
  body("passwordNueva").optional().isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener mínimo 6 caracteres")
]

// ── Handlers ─────────────────────────────────────────────────────────────────

const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body

    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) {
      return res.status(409).json({ message: "El correo ya está registrado" })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: { nombre, email, password: hashedPassword },
      select: {
        id: true, nombre: true, email: true,
        moneda: true, salarioMensual: true, alertasActivas: true, createdAt: true
      }
    })

    const token = generateToken(user)
    res.status(201).json({ message: "Usuario registrado correctamente", token, user })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const token = generateToken(user)
    res.json({
      message: "Inicio de sesión correcto",
      token,
      user: {
        id: user.id, nombre: user.nombre, email: user.email,
        moneda: user.moneda, salarioMensual: user.salarioMensual, alertasActivas: user.alertasActivas
      }
    })
  } catch (error) {
    next(error)
  }
}

const profile = (req, res) => {
  res.json({ user: req.user })
}

const updateProfile = async (req, res, next) => {
  try {
    const { nombre, moneda, salarioMensual, alertasActivas, passwordActual, passwordNueva } = req.body
    const userId = req.user.id

    // Si quiere cambiar contraseña, verificar la actual
    if (passwordNueva) {
      if (!passwordActual) {
        return res.status(400).json({ message: "Debes enviar tu contraseña actual para cambiarla" })
      }
      const userWithPassword = await prisma.user.findUnique({ where: { id: userId } })
      if (!userWithPassword) {
        return res.status(404).json({ message: "Usuario no encontrado" })
      }
      const isValid = await comparePassword(passwordActual, userWithPassword.password)
      if (!isValid) {
        return res.status(401).json({ message: "Contraseña actual incorrecta" })
      }
    }

    const dataUpdate = {}
    if (nombre !== undefined) dataUpdate.nombre = nombre
    if (moneda !== undefined) dataUpdate.moneda = moneda
    if (salarioMensual !== undefined) dataUpdate.salarioMensual = salarioMensual === null ? null : parseFloat(salarioMensual)
    if (alertasActivas !== undefined) dataUpdate.alertasActivas = alertasActivas
    if (passwordNueva) dataUpdate.password = await hashPassword(passwordNueva)

    if (Object.keys(dataUpdate).length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataUpdate,
      select: {
        id: true, nombre: true, email: true,
        moneda: true, salarioMensual: true, alertasActivas: true, updatedAt: true
      }
    })

    res.json({ message: "Perfil actualizado correctamente", user: updated })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  register, registerValidation,
  login, loginValidation,
  profile,
  updateProfile, updateProfileValidation
}
