import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import './Relatorios.css'

function parseData(br) {
  if (!br) return null
  const [d, m, a] = br.split('/')
  return new Date(Number(a), Number(m) - 1, Number(d))
}

// Entrega o arquivo ao navegador como download
function baixarArquivo(blob, nome) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Com responseType 'blob', a mensagem de erro da API também vem como Blob
async function mensagemDeErro(e) {
  try {
    if (e.response?.data instanceof Blob) {
      const json = JSON.parse(await e.response.data.text())
      if (json.erro) return json.erro
    }
  } catch { /* cai na mensagem padrão */ }
  return 'Não foi possível exportar o arquivo.'
}

export default function Relatorios() {
  const [ordens, setOrdens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [status, setStatus] = useState('todos')
  const [responsavel, setResponsavel] = useState('todos')
  const [periodo, setPeriodo] = useState('todos')

  const [menuAberto, setMenuAberto] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [erroExport, setErroExport] = useState('')

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

  async function exportar(formato) {
    setMenuAberto(false)
    setErroExport('')
    setExportando(true)
    try {
      // Envia só os filtros que estão ativos, mais o formato
      const params = { formato }
      if (status !== 'todos') params.status = status
      if (responsavel !== 'todos') params.responsavel = responsavel
      if (periodo !== 'todos') params.periodo = periodo

      const blob = await api.exportOrdersCsv(params)
      baixarArquivo(blob, `ordens-${new Date().toLocaleDateString('sv-SE')}.${formato}`)
    } catch (e) {
      setErroExport(await mensagemDeErro(e))
    } finally {
      setExportando(false)
    }
  }

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

      {erroExport && <p className="rel-erro">{erroExport}</p>}

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

          <div className="rel-export">
            <button
              className="btn-outline"
              disabled={carregando || exportando}
              onClick={() => setMenuAberto((v) => !v)}
            >
              {exportando ? 'Exportando…' : 'Exportar ▾'}
            </button>
            {menuAberto && (
              <div className="rel-export-menu">
                <button onClick={() => exportar('csv')}>CSV</button>
                <button onClick={() => exportar('xlsx')}>Excel (.xlsx)</button>
                <button disabled title="Em breve">PDF (em breve)</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
