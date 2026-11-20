import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'

// A API devolve datas como "dd/mm/aaaa"; converte para Date para filtrar por período
function parseData(br) {
  if (!br) return null
  const [d, m, a] = br.split('/')
  return new Date(Number(a), Number(m) - 1, Number(d))
}

export default function Relatorios() {
  const [ordens, setOrdens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [status, setStatus] = useState('todos')
  const [responsavel, setResponsavel] = useState('todos')
  const [periodo, setPeriodo] = useState('todos')

  useEffect(() => {
    api.listOrders()
      .then(setOrdens)
      .catch(() => setErro('Não foi possível carregar as ordens.'))
      .finally(() => setCarregando(false))
  }, [])

  const statusDisponiveis = useMemo(() => [...new Set(ordens.map((o) => o.status))], [ordens])
  const responsaveis = useMemo(() => [...new Set(ordens.map((o) => o.responsavel))], [ordens])

  const rows = useMemo(() => {
    const limite = periodo === 'todos'
      ? null
      : Date.now() - Number(periodo) * 24 * 60 * 60 * 1000

    return ordens.filter((o) => {
      if (status !== 'todos' && o.status !== status) return false
      if (responsavel !== 'todos' && o.responsavel !== responsavel) return false
      if (limite) {
        const aberta = parseData(o.abertaEm)
        if (!aberta || aberta.getTime() < limite) return false
      }
      return true
    })
  }, [ordens, status, responsavel, periodo])

  return (
    <div className="page">
      <h1>Relatórios</h1>
      <p className="page-sub">Consulte e exporte o histórico de ordens de serviço.</p>

      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Status: todos</option>
          {statusDisponiveis.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
          <option value="todos">Responsável: todos</option>
          {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
          <option value="todos">Período: todos</option>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>OS</th><th>Título</th><th>Prioridade</th><th>Responsável</th><th>Status</th><th>Aberta em</th><th>Concluída em</th>
            </tr>
          </thead>
          <tbody>
            {carregando && <tr><td colSpan={7}>Carregando…</td></tr>}
            {!carregando && erro && <tr><td colSpan={7}>{erro}</td></tr>}
            {!carregando && !erro && rows.length === 0 && (
              <tr><td colSpan={7}>Nenhuma ordem encontrada.</td></tr>
            )}
            {rows.map((o) => (
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
                <td>{o.abertaEm}</td>
                <td>{o.concluidaEm || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>{rows.length} de {ordens.length} ordens</span>
          <div>
            <button className="btn-outline">Exportar PDF</button>
            <button className="btn-outline">Exportar Excel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
