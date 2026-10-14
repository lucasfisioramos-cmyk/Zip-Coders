import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import HistoricoTimeline from './HistoricoTimeline.jsx'
import './HistoricoOrdemModal.css'

export default function HistoricoOrdemModal({ ordem, onClose }) {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let cancelado = false // evita atualizar o estado se o painel foi fechado no meio da requisição
    setLoading(true)
    setErro('')
    api.getOrderHistory(ordem.id)
      .then((data) => { if (!cancelado) setEventos(data.eventos) })
      .catch((err) => {
        if (!cancelado) setErro(err.response?.data?.erro || 'Não foi possível carregar o histórico. Verifique se o backend está no ar.')
      })
      .finally(() => { if (!cancelado) setLoading(false) })
    return () => { cancelado = true }
  }, [ordem.id, tentativa])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="historico-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 id="historico-titulo">Histórico da ordem</h2>
            <p>Tudo o que aconteceu com esta ordem, do início ao fim.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <div className="modal-body">
          <div className="os-summary">
            <span className="os-summary-id">{ordem.id}</span>
            <strong>{ordem.title}</strong>
            <span className="os-summary-resp">Status atual: {ordem.status}</span>
            <span className="os-summary-resp">Prioridade: {ordem.priority}</span>
            <span className="os-summary-resp">Responsável: {ordem.responsavel}</span>
            {ordem.solicitante && (
              <span className="os-summary-resp">Aberta por {ordem.solicitante}{ordem.abertaEm ? ` em ${ordem.abertaEm}` : ''}</span>
            )}
          </div>

          {loading && <p className="page-sub">Carregando histórico...</p>}
          {erro && (
            <div className="login-error">
              {erro}{' '}
              <button type="button" className="link-btn" onClick={() => setTentativa((t) => t + 1)}>Tentar de novo</button>
            </div>
          )}
          {!loading && !erro && <HistoricoTimeline eventos={eventos} />}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
