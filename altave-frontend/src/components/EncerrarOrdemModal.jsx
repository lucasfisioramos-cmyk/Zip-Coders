import { useState } from 'react'

const MIN = 10
const MAX = 5000

export default function EncerrarOrdemModal({ ordem, user, onClose, onConfirm }) {
  const [solucao, setSolucao] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const tamanho = solucao.trim().length
  const valido = tamanho >= MIN && tamanho <= MAX

  async function handleSubmit(e) {
    e.preventDefault()
    if (!valido || loading) return
    setErro('')
    setLoading(true)
    try {
      await onConfirm(solucao.trim())
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível encerrar a ordem.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="encerrar-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 id="encerrar-titulo">Encerrar ordem de serviço</h2>
            <p>Registre o que foi feito para concluir este chamado.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} disabled={loading} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="login-error">{erro}</div>}

            <div className="os-summary">
              <span className="os-summary-id">{ordem.id}</span>
              <strong>{ordem.title}</strong>
              <span className="os-summary-resp">Responsável: {ordem.responsavel}</span>
              <span className="os-summary-resp">Encerrando como: {user.name}</span>
            </div>

            <div className="field">
              <label htmlFor="solucao">Solução aplicada</label>
              <textarea
                id="solucao"
                autoFocus
                maxLength={MAX}
                placeholder="Ex: Substituído o dreno entupido e testado o fluxo por 15 minutos. Sem vazamento."
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
              />
              <div className={`char-count${tamanho > 0 && tamanho < MIN ? ' short' : ''}`}>
                {tamanho < MIN ? `Mínimo de ${MIN} caracteres (${tamanho}/${MIN})` : `${tamanho}/${MAX}`}
              </div>
            </div>
            <p className="modal-hint">O texto fica registrado no histórico da ordem e não pode ser editado depois.</p>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="btn-primary btn-inline" disabled={!valido || loading}>
              {loading ? 'Encerrando...' : 'Encerrar ordem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
