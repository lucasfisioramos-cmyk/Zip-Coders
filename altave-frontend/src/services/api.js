// Camada unica de acesso a dados. O front so fala com essa API (Node/Express),
// nunca com o RDS direto. Ajuste VITE_API_URL (.env) se o backend estiver em outra URL.
// Camada unica de acesso a dados. O front so fala com essa API (Node/Express),
// nunca com o RDS direto. Ajuste VITE_API_URL (.env) se o backend estiver em outra URL.
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
export const API_DOCS_URL = `${BASE_URL.replace(/\/+$/, '')}/docs/`

const http = axios.create({ baseURL: BASE_URL })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('altave_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use((response) => {
  const perfil = response.headers['x-user-perfil']
  if (perfil) window.dispatchEvent(new CustomEvent('altave-profile', { detail: perfil }))
  return response
}, (error) => {
  if (error.response?.status === 401 && !error.config.url.endsWith('/auth/login')) {
    window.dispatchEvent(new Event('altave-session-expired'))
  }
  return Promise.reject(error)
})

export const api = {
  me: () => http.get('/auth/me').then((r) => r.data.user),
  updateOwnName: (nome) => http.patch('/auth/me', { nome }).then((r) => r.data.user),
  profiles: () => http.get('/usuarios/perfis').then((r) => r.data),
  updateUserRole: (id, perfil) => http.patch(`/usuarios/${id}/perfil`, { perfil }).then((r) => r.data),
  updateUserStatus: (id, ativo) => http.patch(`/usuarios/${id}/ativo`, { ativo }).then((r) => r.data),
  login: (email, senha) => http.post('/auth/login', { email, senha }).then((r) => r.data),
  listOrders: (params) => http.get('/ordens', { params }).then((r) => r.data),
  createOrder: (data) => http.post('/ordens', data).then((r) => r.data),
  updateOrder: (id, data) => http.patch(`/ordens/${id}`, data).then((r) => r.data),
  updateOrderStatus: (id, status) => http.patch(`/ordens/${id}/status`, { status }).then((r) => r.data),
  updateOrderPriority: (id, prioridade) => http.patch(`/ordens/${id}/prioridade`, { prioridade }).then((r) => r.data),
  getOrderHistory: (id) => http.get(`/ordens/${id}/historico`).then((r) => r.data),
  closeOrder: (id, solucao) => http.post(`/ordens/${id}/encerrar`, { solucao }).then((r) => r.data),
  listUsers: () => http.get('/usuarios').then((r) => r.data),
  createUser: (data) => http.post('/usuarios', data).then((r) => r.data),
  listNotifications: () => http.get('/notificacoes').then((r) => r.data),
  readNotifications: (ids) => http.post('/notificacoes/lidas', { ids }),
  getDashboardStatus: () => http.get('/dashboard/status').then((r) => r.data),
  exportOrders: (params) =>
    http.get('/relatorios/ordens/exportar', { params, responseType: 'blob' }).then((r) => r.data),
}

