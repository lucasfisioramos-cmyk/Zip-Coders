import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { MenuIcon } from './icons.jsx'
import Notificacoes from './Notificacoes.jsx'
import ContaUsuario from './ContaUsuario.jsx'

const TITLES = {
  '/kanban': 'Quadro Kanban',
  '/relatorios': 'Relatórios',
  '/manual': 'Manual & API',
  '/usuarios': 'Usuários',
}

export default function Layout({ user, onLogout, onProfileChange }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Ordens de Serviço'
  const [collapsed, setCollapsed] = useState(false)
  const [escuro, setEscuro] = useState(() => document.documentElement.dataset.theme === 'dark')
  const rotuloTema = escuro ? 'Ativar tema claro' : 'Ativar tema escuro'

  function trocarTema() {
    const tema = escuro ? 'light' : 'dark'
    document.documentElement.dataset.theme = tema
    setEscuro(!escuro)
    try {
      localStorage.setItem('altave-tema', tema)
    } catch {}
  }

  return (
    <div className={`shell${collapsed ? ' sidebar-collapsed' : ''}`}>
           <Sidebar collapsed={collapsed} user={user} />
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger" aria-label="Menu" onClick={() => setCollapsed((c) => !c)}>
              <MenuIcon />
            </button>
            <h2 className="topbar-title">{title}</h2>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle" type="button" onClick={trocarTema} aria-label={rotuloTema} title={rotuloTema}>
              <span aria-hidden="true">{escuro ? '☀' : '☾'}</span>
            </button>
            {['ADMIN', 'GESTOR'].includes(user.perfil) && <Notificacoes key={user.dbId} />}
            <ContaUsuario key={user.dbId} user={user} onLogout={onLogout} onProfileChange={onProfileChange} />
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
