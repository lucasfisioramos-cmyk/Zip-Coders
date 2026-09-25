import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import { MenuIcon, BellIcon } from './icons.jsx'

const TITLES = {
  '/kanban': 'Quadro Kanban',
  '/relatorios': 'Relatórios',
  '/manual': 'Manual & API',
  '/usuarios': 'Usuários',
}

export default function Layout({ user, onLogout }) {
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'Ordens de Serviço'
  const [collapsed, setCollapsed] = useState(false)

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
          <div className="user" onClick={onLogout} title="Clique para sair">
            <span className="bell"><BellIcon /></span>
            <span className="user-name">{user.name}</span>
            <div className="avatar" style={{ background: user.color }}>{user.id}</div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
