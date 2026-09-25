import { useState } from 'react'
import { RESPONSAVEIS } from '../data/mockData.js'

const today = new Date().toLocaleDateString('pt-BR')

export default function NovaOrdemModal({ user, onClose, onCreate }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '', prioridade: 'Alta', responsavel: 'Não atribuído', prazo: '',
  })

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.titulo.trim()) return
    onCreate(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Nova ordem de serviço</h2>
            <p>Preencha os dados abaixo para abrir um novo chamado.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="field">
              <label>Título da ordem</label>
              <input placeholder="Ex: Vazamento no ar-condicionado da sala 4B" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
            </div>
            <div className="field">
              <label>Descrição</label>
              <textarea placeholder="Descreva o problema, local e qualquer detalhe relevante para quem for atender." value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
            </div>
            <div className="modal-row">
              <div className="field">
                <label>Prioridade</label>
                <select value={form.prioridade} onChange={(e) => set('prioridade', e.target.value)}>
                  <option>Alta</option><option>Média</option><option>Baixa</option>
                </select>
              </div>
              <div className="field">
                <label>Responsável</label>
                <select value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)}>
                  {RESPONSAVEIS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Prazo previsto</label>
              <input type="date" value={form.prazo} onChange={(e) => set('prazo', e.target.value)} />
            </div>

            <div className="modal-divider" />

            <div className="modal-row">
              <div className="field">
                <label>Solicitante</label>
                <input disabled value={user.name} className="input-disabled" />
              </div>
              <div className="field">
                <label>Data de abertura</label>
                <input disabled value={today} className="input-disabled" />
              </div>
            </div>
            <p className="modal-hint">Solicitante e data são preenchidos automaticamente pelo sistema.</p>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary btn-inline">Criar ordem</button>
          </div>
        </form>
      </div>
    </div>
  )
}
