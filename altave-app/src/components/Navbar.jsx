import React, { useEffect, useRef, useState } from 'react';
import { KanbanIcon, ReportsIcon, ManualIcon, ConfigIcon, BellIcon } from './Icons.jsx';
import altaveMark from '../assets/altave-mark-white.png';

const NAV_ITEMS = [
  { key: 'kanban', label: 'Quadro Kanban', icon: KanbanIcon },
  { key: 'relatorios', label: 'Relatórios', icon: ReportsIcon },
  { key: 'manual', label: 'Manual & API', icon: ManualIcon },
  { key: 'config', label: 'Configurações', icon: ConfigIcon, adminOnly: true },
];

export default function Navbar({ view, setView, role, setRole }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  function toggleNotif(e) {
    e.stopPropagation();
    setNotifOpen((v) => !v);
    setNotifRead(true);
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src={altaveMark} alt="" className="icon" />
        <span className="name">Altave</span>
        <div className="sep" />
        <span className="product">Ordens de Serviço</span>
      </div>

      <div className="nav-tabs">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === 'Administrador').map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={'nav-tab' + (view === item.key ? ' active' : '')}
              onClick={() => setView(item.key)}
            >
              <Icon />
              <span className="lbl">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="nav-right">
        <div className="notif-wrap" ref={wrapRef}>
          <div className="nav-icon-btn" title="Notificações" onClick={toggleNotif}>
            <BellIcon />
            {!notifRead && <div className="notif-dot" />}
          </div>
          {notifOpen && (
            <div className="notif-panel">
              <div className="nph">Notificações</div>
              <div className="notif-item">
                <b>Ana Ferreira</b> moveu OS-2026-0139 para Em andamento
                <div className="t">2 h atrás</div>
              </div>
              <div className="notif-item">
                Nova ordem aberta: <b>OS-2026-0142</b> — Porta de emergência com trava solta
                <div className="t">3 h atrás</div>
              </div>
              <div className="notif-item">
                <b>OS-2026-0128</b> foi concluída por João Pedro
                <div className="t">Ontem</div>
              </div>
            </div>
          )}
        </div>

        <div className="nav-user">
          <div className="avatar" style={{ background: '#7C5CBF' }}>
            CD
          </div>
          <div className="who">
            <span className="n">Carlos Dias</span>
            <select
              className="role-switcher"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              title="Ver o sistema como outro perfil de acesso"
            >
              <option value="Administrador">Administrador</option>
              <option value="Gestor">Gestor</option>
              <option value="Executor">Executor</option>
              <option value="Usuário padrão">Usuário padrão</option>
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
}
