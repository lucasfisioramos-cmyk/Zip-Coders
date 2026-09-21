import React, { useEffect, useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import {
  PRIORITY_COLOR_VAR,
  PRIORITY_LABEL_LONG,
  STATUS_COLOR_VAR,
  STATUS_LABEL_CAP,
} from '../utils/deadline.js';

const STATUS_ORDER = ['aberta', 'andamento', 'concluida'];

export default function OrderDrawer({ order, onClose, onSave, canManage }) {
  const [status, setStatus] = useState(order ? order.status : 'aberta');
  const [responsavel, setResponsavel] = useState(order ? order.responsavel : 'Não atribuído');

  // Sempre que uma ordem diferente é aberta, sincroniza os campos editáveis com os dados dela.
  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setResponsavel(order.responsavel);
    }
  }, [order]);

  if (!order) return null;

  function handleSave() {
    if (!canManage) {
      onClose();
      return;
    }
    onSave(order.id, { status, responsavel });
  }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="top">
            <span className="id">{order.id}</span>
            <div className="modal-close" onClick={onClose}>
              <CloseIcon />
            </div>
          </div>
          <h2>{order.title}</h2>
          <div className="drawer-meta">
            <span className="meta-chip">
              <span className="d" style={{ background: PRIORITY_COLOR_VAR[order.priority] }} />
              {PRIORITY_LABEL_LONG[order.priority]}
            </span>
            <span className="meta-chip">
              <span className="d" style={{ background: STATUS_COLOR_VAR[order.status] }} />
              {STATUS_LABEL_CAP[order.status]}
            </span>
            <span className="meta-chip">Aberta em {order.abertura}</span>
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <h4>Status</h4>
            <div className="status-control">
              {STATUS_ORDER.map((s) => (
                <div
                  key={s}
                  className={'status-opt' + (status === s ? ' active' : '')}
                  style={{ pointerEvents: canManage ? '' : 'none', opacity: canManage ? '' : 0.5 }}
                  onClick={() => canManage && setStatus(s)}
                >
                  {STATUS_LABEL_CAP[s]}
                </div>
              ))}
            </div>
            {!canManage && (
              <div className="perm-note">
                Apenas executores, gestores e administradores podem alterar o status ou o responsável.
              </div>
            )}
          </div>

          <div className="drawer-section">
            <h4>Descrição</h4>
            <p className="desc-text">{order.desc}</p>
          </div>

          <div className="drawer-section">
            <h4>Detalhes</h4>
            <div className="info-grid">
              <div className="info-item">
                <div className="l">Solicitante</div>
                <div className="v">{order.solicitante}</div>
              </div>
              <div className="info-item">
                <div className="l">Responsável</div>
                <select
                  className="role-select full"
                  value={responsavel}
                  disabled={!canManage}
                  onChange={(e) => setResponsavel(e.target.value)}
                >
                  <option>Não atribuído</option>
                  <option>Ana Ferreira</option>
                  <option>Carlos Dias</option>
                  <option>João Pedro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="drawer-section">
            <h4>Histórico</h4>
            <div className="timeline">
              {[...order.history]
                .reverse()
                .map((h, i) => (
                  <div className="tl-item" key={order.history.length - i}>
                    <div className="tl-dot" style={{ background: i === 0 ? 'var(--blue)' : 'var(--text-muted)' }} />
                    <div>
                      <div className="tl-text">{h.text}</div>
                      <div className="tl-time">{h.time}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>
            Fechar
          </button>
          {canManage && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              Salvar alterações
            </button>
          )}
        </div>
      </div>
    </>
  );
}
