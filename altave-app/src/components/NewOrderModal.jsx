import React, { useState } from 'react';
import { CloseIcon } from './Icons.jsx';

const DEFAULT_PRAZO = '2026-09-17';

export default function NewOrderModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('alta');
  const [responsavel, setResponsavel] = useState('Não atribuído');
  const [prazo, setPrazo] = useState(DEFAULT_PRAZO);

  if (!open) return null;

  function reset() {
    setTitle('');
    setDesc('');
    setPriority('alta');
    setResponsavel('Não atribuído');
    setPrazo(DEFAULT_PRAZO);
  }

  function handleCreate() {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), desc: desc.trim(), priority, responsavel, prazo });
    reset();
  }

  function handleClose() {
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <h2>Nova ordem de serviço</h2>
          <div className="modal-close" onClick={handleClose}>
            <CloseIcon />
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Título da ordem</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Vazamento no ar-condicionado da sala 4B"
            />
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descreva o problema, local e qualquer detalhe relevante para quem for atender."
            />
          </div>
          <div className="row-2">
            <div className="field">
              <label>Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="field">
              <label>Responsável</label>
              <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
                <option>Não atribuído</option>
                <option>Ana Ferreira</option>
                <option>Carlos Dias</option>
                <option>João Pedro</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Prazo previsto</label>
            <input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </div>
          <div className="row-2">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Solicitante</label>
              <input
                type="text"
                value="Carlos Dias"
                disabled
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
                readOnly
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Data de abertura</label>
              <input
                type="text"
                value="10/09/2026"
                disabled
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
                readOnly
              />
            </div>
          </div>
          <div className="readonly-note">Solicitante e data são preenchidos automaticamente pelo sistema.</div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            Criar ordem
          </button>
        </div>
      </div>
    </div>
  );
}
