import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
}

export const ingresosService = {
  getAll: (params) => api.get('/ingresos', { params }),
  getById: (id) => api.get(`/ingresos/${id}`),
  create: (data) => api.post('/ingresos', data),
  update: (id, data) => api.put(`/ingresos/${id}`, data),
  delete: (id) => api.delete(`/ingresos/${id}`),
}

export const gastosService = {
  getAll: (params) => api.get('/gastos', { params }),
  getById: (id) => api.get(`/gastos/${id}`),
  create: (data) => api.post('/gastos', data),
  update: (id, data) => api.put(`/gastos/${id}`, data),
  delete: (id) => api.delete(`/gastos/${id}`),
}

export const deudasService = {
  getAll: (params) => api.get('/deudas', { params }),
  getById: (id) => api.get(`/deudas/${id}`),
  create: (data) => api.post('/deudas', data),
  update: (id, data) => api.put(`/deudas/${id}`, data),
  delete: (id) => api.delete(`/deudas/${id}`),
}

export const tarjetasService = {
  getAll: (params) => api.get('/tarjetas', { params }),
  getById: (id) => api.get(`/tarjetas/${id}`),
  create: (data) => api.post('/tarjetas', data),
  update: (id, data) => api.put(`/tarjetas/${id}`, data),
  delete: (id) => api.delete(`/tarjetas/${id}`),
}

export const pagosService = {
  getAll: (params) => api.get('/pagos', { params }),
  getById: (id) => api.get(`/pagos/${id}`),
  create: (data) => api.post('/pagos', data),
}

export const amortizacionService = {
  generar: (deudaId) => api.post(`/amortizacion/generar/${deudaId}`),
  getPorDeuda: (deudaId, params) => api.get(`/amortizacion/deuda/${deudaId}`, { params }),
  getCuota: (id) => api.get(`/amortizacion/cuota/${id}`),
  create: (data) => api.post('/amortizacion', data),
  update: (id, data) => api.put(`/amortizacion/${id}`, data),
  delete: (id) => api.delete(`/amortizacion/${id}`),
}

export const reportesService = {
  resumen: () => api.get('/reportes/resumen'),
  gastosPorCategoria: (params) => api.get('/reportes/gastos-categoria', { params }),
  ingresosVsGastos: (params) => api.get('/reportes/ingresos-vs-gastos', { params }),
  deudas: () => api.get('/reportes/deudas'),
  proximosPagos: (params) => api.get('/reportes/proximos-pagos', { params }),
  flujoCaja: (params) => api.get('/reportes/flujo-caja', { params }),
}

export default api
