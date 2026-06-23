import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatMoney = (amount, currency = 'USD') => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt, { locale: es })
  } catch {
    return '—'
  }
}

export const formatDateInput = (date) => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'yyyy-MM-dd')
  } catch {
    return ''
  }
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Ocurrió un error inesperado'
}

export const getValidationErrors = (error) => {
  return error?.response?.data?.errors || []
}

export const MONEDAS = ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'CLP', 'PEN', 'BRL']
export const TIPOS_DEUDA = ['CREDITO', 'HIPOTECA', 'VEHICULO', 'PERSONAL', 'TARJETA', 'OTRO']
export const ESTADOS_DEUDA = ['ACTIVA', 'PAGADA', 'EN_MORA', 'REFINANCIADA']
export const FRANQUICIAS = ['VISA', 'MASTERCARD', 'AMEX', 'DINERS', 'DISCOVER', 'OTRA']
export const ESTADOS_TARJETA = ['ACTIVA', 'BLOQUEADA', 'CANCELADA']

export const CATEGORIAS_GASTO = [
  'Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Educación',
  'Entretenimiento', 'Ropa', 'Tecnología', 'Servicios', 'Ahorro', 'Otro'
]
