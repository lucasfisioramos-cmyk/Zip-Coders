import React, { useState } from 'react';

const MEMBERS = [
  { name: 'Carlos Dias', email: 'carlos.dias@altave.com', color: '#7C5CBF', initials: 'CD', role: 'Gestor' },
  { name: 'Ana Ferreira', email: 'ana.ferreira@altave.com', color: '#2E9E6D', initials: 'AF', role: 'Executor' },
  { name: 'João Pedro', email: 'joao.pedro@altave.com', color: '#D6852E', initials: 'JP', role: 'Executor' },
  { name: 'Marcos Lima', email: 'marcos.lima@altave.com', color: 'var(--text-muted)', initials: 'ML', role: 'Executor' },
];

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [systemAlert, setSystemAlert] = useState(true);
  const [deadlineWarn, setDeadlineWarn] = useState(false);

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Configurações</h1>
          <div className="sub">Perfis de acesso e preferências de notificação. Visível apenas para administradores.</div>
        </div>
      </div>
      <div className="config-grid">
        <div className="card-block">
          <h3>Perfis de acesso</h3>
          <div className="desc">Defina o nível de acesso de cada colaborador dentro do sistema.</div>
          {MEMBERS.map((m) => (
            <div className="member-row" key={m.email}>
              <div className="avatar" style={{ background: m.color }}>
                {m.initials}
              </div>
              <div className="info">
                <div className="n">{m.name}</div>
                <div className="e">{m.email}</div>
              </div>
              <select className="role-select" defaultValue={m.role}>
                <option>Gestor</option>
                <option>Administrador</option>
                <option>Executor</option>
                <option>Usuário padrão</option>
              </select>
            </div>
          ))}
        </div>

        <div className="card-block">
          <h3>Notificações</h3>
          <div className="desc">Escolha como cada colaborador é avisado sobre mudanças nas ordens.</div>
          <SwitchRow
            label="Notificação por e-mail"
            desc="Ao criar, mover ou encerrar uma ordem"
            checked={emailNotif}
            onToggle={() => setEmailNotif((v) => !v)}
          />
          <SwitchRow
            label="Alerta dentro do sistema"
            desc="Sino de notificações na barra superior"
            checked={systemAlert}
            onToggle={() => setSystemAlert((v) => !v)}
          />
          <SwitchRow
            label="Aviso de prazo"
            desc="Ordens de prioridade alta há mais de 2 dias"
            checked={deadlineWarn}
            onToggle={() => setDeadlineWarn((v) => !v)}
          />
        </div>
      </div>
    </section>
  );
}

function SwitchRow({ label, desc, checked, onToggle }) {
  return (
    <div className="switch-row">
      <div>
        <div className="n">{label}</div>
        <div className="d">{desc}</div>
      </div>
      <div className={'switch' + (checked ? ' on' : '')} onClick={onToggle} />
    </div>
  );
}
