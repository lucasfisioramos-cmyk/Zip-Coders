// Camada unica de acesso a dados. O front so fala com essa API (Node/Express),
// nunca com o RDS direto. Ajuste VITE_API_URL (.env) se o backend estiver em outra URL.
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const http = axios.create({ baseURL: BASE_URL })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('altave_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const api = {
  login: (email, senha) => http.post('/auth/login', { email, senha }).then((r) => r.data),
  listOrders: (params) => http.get('/ordens', { params }).then((r) => r.data),
  createOrder: (data) => http.post('/ordens', data).then((r) => r.data),
  updateOrderStatus: (id, status) => http.patch(`/ordens/${id}/status`, { status }).then((r) => r.data),
  listUsers: () => http.get('/usuarios').then((r) => r.data),
  createUser: (data) => http.post('/usuarios', data).then((r) => r.data),
}
