const { PrismaClient } = require("@prisma/client")
const { hashPassword, comparePassword } = require("../../utils/password")
const { generateToken } = require("../../utils/jwt")

const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" })
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userExists) {
      return res.status(400).json({ message: "El correo ya está registrado" })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        moneda: true,
        salarioMensual: true,
        alertasActivas: true,
        createdAt: true
      }
    })

    const token = generateToken(user)

    res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user
    })
  } catch (error) {
    res.status(500).json({ message: "Error en el registro" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const token = generateToken(user)

    res.json({
      message: "Inicio de sesión correcto",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        moneda: user.moneda,
        salarioMensual: user.salarioMensual,
        alertasActivas: user.alertasActivas
      }
    })
  } catch (error) {
    res.status(500).json({ message: "Error en el login" })
  }
}

const profile = async (req, res) => {
  res.json({
    message: "Perfil obtenido correctamente",
    user: req.user
  })
}

module.exports = {
  register,
  login,
  profile
}