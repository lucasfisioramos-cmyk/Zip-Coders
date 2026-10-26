import { useState } from 'react'
import { RESPONSAVEIS } from '../data/mockData.js'

const MIN = 5
const MAX = 1000

export default function EditarOrdemModal({ ordem, onClose, onConfirm }) {
  const inicial = {
    titulo: ordem.title,
    descricao: ordem.descricao || '',
    prioridade: ordem.priority,
    responsavel: ordem.responsavel,
  }
  const [form, setForm] = useState(inicial)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const rotulos = { titulo: 'Título', descricao: 'Descrição', prioridade: 'Prioridade', responsavel: 'Responsável' }
  const alterados = Object.keys(inicial).filter((k) => form[k] !== inicial[k])
  const valido = alterados.length > 0 && form.titulo.trim() && motivo.trim().length >= MIN

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valido || loading) return
    setErro('')
    setLoading(true)
    try {
      // só envia o que mudou
      await onConfirm({ ...Object.fromEntries(alterados.map((k) => [k, form[k]])), motivo: motivo.trim() })
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível salvar a alteração.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="editar-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 id="editar-titulo">Editar {ordem.id}</h2>
            <p>Toda alteração exige uma justificativa e notifica os envolvidos por e-mail.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} disabled={loading} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="login-error">{erro}</div>}

            <div className="field">
              <label htmlFor="ed-titulo">Título da ordem</label>
              <input id="ed-titulo" maxLength={150} value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ed-desc">Descrição</label>
              <textarea id="ed-desc" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} />
            </div>
            <div className="modal-row">
              <div className="field">
                <label htmlFor="ed-prio">Prioridade</label>
                <select id="ed-prio" value={form.prioridade} onChange={(e) => set('prioridade', e.target.value)}>
                  <option>Alta</option><option>Média</option><option>Baixa</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="ed-resp">Responsável</label>
                <select id="ed-resp" value={form.responsavel} onChange={(e) => set('responsavel', e.target.value)}>
                  {RESPONSAVEIS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="modal-divider" />

            <div className="os-summary">
              <strong>Resumo das alterações</strong>
              {alterados.length === 0
                ? <span className="os-summary-resp">Nenhum campo alterado ainda.</span>
                : alterados.map((k) => (
                    <span key={k} className="os-summary-resp">{rotulos[k]}: {inicial[k] || '—'} → {form[k] || '—'}</span>
                  ))}
            </div>

            <div className="field">
              <label htmlFor="ed-motivo">Breve descrição da alteração *</label>
              <textarea
                id="ed-motivo"
                maxLength={MAX}
                placeholder="Ex: Prioridade elevada após o cliente informar risco de parada."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
              <div className={`char-count${motivo.trim().length > 0 && motivo.trim().length < MIN ? ' short' : ''}`}>
                {motivo.trim().length < MIN ? `Obrigatório, mínimo de ${MIN} caracteres` : `${motivo.length}/${MAX}`}
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary btn-inline" disabled={!valido || loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
