import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Kanban from './pages/Kanban.jsx'
import Relatorios from './pages/Relatorios.jsx'
import Manual from './pages/Manual.jsx'
import Usuarios from './pages/Usuarios.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('altave_user')
    return saved ? JSON.parse(saved) : null
  })

  function handleLogin(u) {
    localStorage.setItem('altave_user', JSON.stringify(u))
    setUser(u)
  }

  function handleLogout() {
    localStorage.removeItem('altave_token')
    localStorage.removeItem('altave_user')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Navigate to="/kanban" replace />} />
        <Route path="/kanban" element={<Kanban user={user} />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/manual" element={<Manual />} />
               <Route path="/usuarios" element={['ADMIN', 'GESTOR'].includes(user.perfil) ? <Usuarios /> : <Navigate to="/kanban" replace />} />
      </Route>
    </Routes>
  )
}
