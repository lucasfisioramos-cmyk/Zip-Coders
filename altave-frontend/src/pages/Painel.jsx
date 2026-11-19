import { useMemo, useState } from 'react'
import { useDashboard } from '../hooks/useDashboard.js'
import './Painel.css'

const CARTOES = [
  { chave: 'abertas', rotulo: 'Abertas', status: 'aberta' },
  { chave: 'emAndamento', rotulo: 'Em andamento', status: 'em andamento' },
  { chave: 'concluidas', rotulo: 'Concluídas', status: 'concluida' },
]

// Normaliza ("Concluída" -> "concluida") para comparar com o filtro do cartão
const normalizar = (s) =>
  String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function Painel() {
  const { totais, ordens, carregando, erro, atualizadoEm, recarregar } = useDashboard()
  const [filtro, setFiltro] = useState(null) // null = todas

  const linhas = useMemo(
    () => (filtro ? ordens.filter((o) => normalizar(o.status) === filtro) : ordens),
    [ordens, filtro]
  )

  return (
    <div className="page">
      <h1>Painel</h1>
      <p className="page-sub">
        Volume e status das ordens de serviço.{' '}
        {atualizadoEm && (
          <span>Atualizado às {new Date(atualizadoEm).toLocaleTimeString('pt-BR')}.</span>
        )}
      </p>

      {erro && <p className="painel-erro">{erro}</p>}

      <div className="painel-cards">
        {CARTOES.map((c) => (
          <button
            key={c.chave}
            type="button"
            className={`painel-card ${filtro === c.status ? 'ativo' : ''}`}
            onClick={() => setFiltro(filtro === c.status ? null : c.status)}
          >
            <span className="painel-card-rotulo">{c.rotulo}</span>
            <span className="painel-card-valor">
              {totais ? totais[c.chave] : '—'}
            </span>
          </button>
        ))}
        <div className="painel-card painel-card-total">
          <span className="painel-card-rotulo">Total</span>
          <span className="painel-card-valor">{totais ? totais.total : '—'}</span>
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>OS</th><th>Título</th><th>Prioridade</th><th>Responsável</th><th>Status</th><th>Tempo</th>
            </tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan={6}>Carregando painel…</td></tr>}
            {!carregando && !erro && linhas.length === 0 && (
              <tr><td colSpan={6}>Nenhuma ordem encontrada.</td></tr>
            )}
            {linhas.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td><span className={`badge ${o.priority}`}>{o.priority}</span></td>
                <td>{o.responsavel}</td>
                <td>
                  <span className="status-pill">
                    <span className={`dot ${o.status.replace(' ', '.')}`} />
                    {o.status}
                  </span>
                </td>
                <td>{o.agingLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>
            {linhas.length} de {ordens.length} ordens
            {filtro && ' (filtrado — clique no cartão de novo para limpar)'}
          </span>
          <button className="btn-outline" onClick={recarregar}>Atualizar agora</button>
        </div>
      </div>
    </div>
  )
}