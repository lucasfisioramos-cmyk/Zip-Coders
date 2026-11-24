import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { api } from './services/api.js'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Kanban from './pages/Kanban.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Manual from './pages/Manual.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Historico from './pages/Historico.jsx'
import Painel from './pages/Painel.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('altave_user')
    try { return saved ? JSON.parse(saved) : null } catch { return null }
  })

  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [sessionError, setSessionError] = useState('')
  useEffect(() => {
    let active = true
    setChecking(true)
    setSessionError('')
    if (!localStorage.getItem('altave_token')) { handleLogout(); setChecking(false); return }
    api.me().then((u) => { if (active) handleLogin(u) })
      .catch((err) => { if (active && err.response?.status !== 401) setSessionError('Não foi possível validar suas permissões. Recarregue a página.') })
      .finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [location.pathname, user?.dbId])
  useEffect(() => {
    function updateProfile(event) {
      setUser((current) => {
        if (!current || current.perfil === event.detail) return current
        const roles = { ADMIN: 'Administrador', GESTOR: 'Gestor', EXECUTOR: 'Executor', USUARIO: 'Usuário Padrão' }
        const updated = { ...current, perfil: event.detail, role: roles[event.detail] }
        localStorage.setItem('altave_user', JSON.stringify(updated))
        return updated
      })
    }
    window.addEventListener('altave-profile', updateProfile)
    window.addEventListener('altave-session-expired', handleLogout)
    return () => {
      window.removeEventListener('altave-profile', updateProfile)
      window.removeEventListener('altave-session-expired', handleLogout)
    }
  }, [])

  const forbidden = <div className="page" role="alert"><h1>Acesso não autorizado</h1></div>
  const admin = user?.perfil === 'ADMIN'
  const management = ['ADMIN', 'GESTOR'].includes(user?.perfil)

  function handleLogin(u) {
    localStorage.setItem('altave_user', JSON.stringify(u))
    setUser(u)
  }

  function handleProfileChange(atualizado) {
    if (user?.dbId === atualizado.dbId && localStorage.getItem('altave_token')) {
      handleLogin(atualizado)
    }
  }

  function handleLogout() {
    localStorage.removeItem('altave_token')
    localStorage.removeItem('altave_user')
    setUser(null)
  }

  if (checking) return <p>Validando acesso...</p>
  if (sessionError) return <p role="alert">{sessionError}</p>
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={handleLogout} onProfileChange={handleProfileChange} />}>
        <Route path="/" element={<Navigate to="/kanban" replace />} />
        <Route path="/kanban" element={<Kanban user={user} />} />
        <Route path="/relatorios" element={management ? <Relatorios /> : forbidden} />
        <Route path="/historico/:codigo" element={<Historico />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/painel" element={management ? <Painel /> : <Navigate to="/kanban" replace />} />
        <Route path="/usuarios" element={management ? <Usuarios user={user} /> : forbidden} />
        <Route path="/admin/perfis" element={admin ? <Usuarios user={user} /> : forbidden} />
      </Route>
    </Routes>
  )
}
