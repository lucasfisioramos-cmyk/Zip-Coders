import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { SearchIcon, BoardIcon, ChartIcon, BookIcon, IconUsers } from './icons.jsx'

const ITEMS = [
  { to: '/kanban', label: 'Quadro Kanban', Icon: BoardIcon },
  { to: '/relatorios', label: 'Relatórios', Icon: ChartIcon },
  { to: '/manual', label: 'Manual & API', Icon: BookIcon },
  { to: '/usuarios', label: 'Usuários', Icon: IconUsers },
]

export default function Sidebar({ collapsed, user }) {
  const [query, setQuery] = useState('')
  const podeGerenciarUsuarios = user && ['ADMIN', 'GESTOR'].includes(user.perfil)
  const visiveis = ITEMS.filter((i) => i.to !== '/usuarios' || podeGerenciarUsuarios)
  const items = visiveis.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-logo">
        <img src="/altave-logo.png" alt="Altave" />
      </div>

      {!collapsed && (
        <div className="sidebar-search">
          <SearchIcon />
          <input
            placeholder="Procurar opção do menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {!collapsed && <div className="sidebar-section">Ordens de Serviço</div>}
      <nav className="sidebar-nav">
        {items.length === 0 && !collapsed && <p className="sidebar-empty">Nada encontrado.</p>}
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}
          >
            <span className="sidebar-item-icon"><Icon /></span>
            {!collapsed && <span className="sidebar-item-label">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
