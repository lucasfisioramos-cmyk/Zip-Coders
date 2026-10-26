import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api.js'
import './Historico.css'

const TIPOS = {
  criacao: 'Criação',
  mudanca: 'Mudança de status',
  encerramento: 'Encerramento',
  reabertura: 'Reabertura',
}

const PERIODOS = [
  { valor: 'todos', label: 'Período: todos' },
  { valor: '7', label: 'Últimos 7 dias' },
  { valor: '30', label: 'Últimos 30 dias' },
]

function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusPill({ status }) {
  return (
    <span className="status-pill">
      <span className={`dot ${status.replace(' ', '.')}`} />
      {status}
    </span>
  )
}

export default function Historico() {
  const { codigo } = useParams()
  const [ordem, setOrdem] = useState(null)
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [tipo, setTipo] = useState('todos')
  const [quem, setQuem] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [periodo, setPeriodo] = useState('todos')

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro('')

    api.getOrderHistory(codigo)
      .then((data) => {
        if (!ativo) return
        setOrdem({ codigo: data.codigo, titulo: data.titulo })
        setEventos(data.eventos)
      })
      .catch((e) => {
        if (!ativo) return
        setErro(e.response?.status === 404
          ? 'Ordem não encontrada.'
          : 'Não foi possível carregar o histórico.')
      })
      .finally(() => { if (ativo) setCarregando(false) })

    return () => { ativo = false }
  }, [codigo])

  const usuarios = useMemo(() => [...new Set(eventos.map((e) => e.quem))], [eventos])
  const statusDisponiveis = useMemo(() => [...new Set(eventos.map((e) => e.para))], [eventos])

  const filtrados = useMemo(() => {
    const limite = periodo === 'todos'
      ? null
      : Date.now() - Number(periodo) * 24 * 60 * 60 * 1000

    return eventos.filter((e) => {
      if (tipo !== 'todos' && e.tipo !== tipo) return false
      if (quem !== 'todos' && e.quem !== quem) return false
      if (status !== 'todos' && e.para !== status) return false
      if (limite && new Date(e.em).getTime() < limite) return false
      return true
    })
  }, [eventos, tipo, quem, status, periodo])

  function limparFiltros() {
    setTipo('todos')
    setQuem('todos')
    setStatus('todos')
    setPeriodo('todos')
  }

  return (
    <div className="page">
      <h1>Histórico {ordem ? `— ${ordem.codigo}` : ''}</h1>
      <p className="page-sub">
        {ordem ? `${ordem.titulo}. ` : ''}
        Todas as alterações registradas nesta ordem de serviço.{' '}
        <Link to="/kanban">Voltar ao Kanban</Link>
      </p>

      <div className="filters">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="todos">Tipo: todos</option>
          {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>

        <select value={quem} onChange={(e) => setQuem(e.target.value)}>
          <option value="todos">Usuário: todos</option>
          {usuarios.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Status: todos</option>
          {statusDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          {PERIODOS.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
        </select>

        <button className="btn-outline" onClick={limparFiltros}>Limpar filtros</button>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Data</th><th>Tipo</th><th>Alteração</th><th>Usuário</th><th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan={5}>Carregando histórico…</td></tr>}
            {!carregando && erro && <tr><td colSpan={5}>{erro}</td></tr>}
            {!carregando && !erro && filtrados.length === 0 && (
              <tr><td colSpan={5}>Nenhum evento encontrado para esses filtros.</td></tr>
            )}
            {filtrados.map((ev) => (
              <tr key={ev.id}>
                <td>{formatarData(ev.em)}</td>
                <td><span className={`hist-tipo hist-tipo-${ev.tipo}`}>{TIPOS[ev.tipo] || ev.tipo}</span></td>
                <td>
                  {ev.de && <><StatusPill status={ev.de} /> <span className="hist-seta">→</span> </>}
                  <StatusPill status={ev.para} />
                </td>
                <td>
                  <span className="hist-avatar" style={{ background: ev.avatarColor }}>{ev.avatar}</span>
                  {ev.quem}
                </td>
                <td className="hist-obs">{ev.observacao || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>{filtrados.length} de {eventos.length} eventos</span>
        </div>
      </div>
    </div>
  )
}