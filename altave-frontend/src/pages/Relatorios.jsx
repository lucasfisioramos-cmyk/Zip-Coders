import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import './Relatorios.css'

const FILTROS_PADRAO = { status: '', responsavel: '', dataInicio: '', dataFim: '' }
const STATUS = [
  ['Aberta', 'var(--gray)'],
  ['Em andamento', 'var(--blue)'],
  ['Concluída', 'var(--green)'],
]
const PRIORIDADES = [
  ['Urgente', 'var(--red)'],
  ['Alta', '#E8772E'],
  ['Média', '#E3B505'],
  ['Baixa', 'var(--green)'],
]

function categoriasPorResponsavel(ordens) {
  const nomes = new Map(
    (ordens ?? []).map((ordem) => [ordem.responsavelId ?? null, ordem.responsavel]),
  )
  const pessoas = [...nomes]
    .filter(([id]) => id !== null)
    .sort(([idA, nomeA], [idB, nomeB]) => nomeA.localeCompare(nomeB, 'pt-BR') || idA.localeCompare(idB))

  const categorias = pessoas.map(([id, nome], indice) => [
    nome, `hsl(${(210 + indice * 137.5) % 360} 58% 43%)`, id,
  ])
  if (nomes.has(null)) categorias.push(['Sem responsável', 'var(--gray)', null])
  return categorias
}

function fundoPizza(fatias, total) {
  if (!total) return undefined

  let acumulado = 0
  const segmentos = fatias.filter(({ quantidade }) => quantidade > 0).map(({ cor, quantidade }) => {
    const inicio = acumulado / total * 100
    acumulado += quantidade
    return `${cor} ${inicio}% ${acumulado / total * 100}%`
  })
  return segmentos.length ? `conic-gradient(${segmentos.join(', ')})` : undefined
}

function GraficoOrdens({ titulo, ordens, campo, categorias, pizza }) {
  const contagem = new Map()
  for (const ordem of ordens ?? []) {
    const valor = ordem[campo] ?? null
    contagem.set(valor, (contagem.get(valor) ?? 0) + 1)
  }
  const total = ordens?.length ?? 0
  const fatias = categorias.map(([rotulo, cor, chave = rotulo]) => ({
    chave, rotulo, cor, quantidade: contagem.get(chave) ?? 0,
  }))

  return (
    <figure className={`rel-grafico${pizza ? ' rel-grafico--pizza' : ''}`}>
      <figcaption>{titulo}</figcaption>
      {pizza && (
        <div className="rel-grafico-pizza" aria-hidden="true" style={{ backgroundImage: fundoPizza(fatias, total) }} />
      )}
      {fatias.length === 0 ? (
        <p className="rel-grafico-vazio">{ordens ? 'Nenhuma ordem para exibir.' : 'Carregando…'}</p>
      ) : (
        <ul>
          {fatias.map(({ chave, rotulo, cor, quantidade }) => (
            <li key={chave ?? 'sem-responsavel'}>
              {pizza && <span className="rel-grafico-legenda" aria-hidden="true" style={{ backgroundColor: cor }} />}
              <span>{rotulo}</span>
              {!pizza && (
                <span className="rel-grafico-trilho" aria-hidden="true">
                  <span style={{ width: `${total ? quantidade / total * 100 : 0}%`, backgroundColor: cor }} />
                </span>
              )}
              <strong>{ordens ? quantidade : '—'}</strong>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}

function parametros(filtros) {
  return Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor))
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

  const [filtros, setFiltros] = useState({ ...FILTROS_PADRAO })
  const [responsaveis, setResponsaveis] = useState([])
  const [totalOrdens, setTotalOrdens] = useState(null)

  const [pizza, setPizza] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [erroExport, setErroExport] = useState('')
  const ordensGrafico = carregando ? null : ordens
  const carregamentoInicial = carregando && totalOrdens === null
  const intervaloInvalido = Boolean(filtros.dataInicio && filtros.dataFim && filtros.dataInicio > filtros.dataFim)

  useEffect(() => {
    if (intervaloInvalido) {
      setCarregando(false)
      setOrdens([])
      setErro('A data inicial deve ser anterior ou igual à data final.')
      return
    }

    let ativa = true
    const params = parametros(filtros)
    setCarregando(true)
    setErro('')
    api.listOrders(params)
      .then((dados) => {
        if (!ativa) return
        setOrdens(dados)
        if (Object.keys(params).length === 0) {
          setResponsaveis([...new Set(dados.map((ordem) => ordem.responsavel))].sort((a, b) => a.localeCompare(b, 'pt-BR')))
          setTotalOrdens(dados.length)
        }
      })
      .catch((falha) => {
        if (!ativa) return
        setOrdens([])
        setErro(falha.response?.data?.erro || 'Não foi possível carregar as ordens.')
      })
      .finally(() => { if (ativa) setCarregando(false) })
    return () => { ativa = false }
  }, [filtros, intervaloInvalido])

  function alterarFiltro(evento) {
    const { name, value } = evento.target
    setFiltros((anterior) => ({ ...anterior, [name]: value }))
    setMenuAberto(false)
    setErroExport('')
  }

  function limparFiltros() {
    setFiltros({ ...FILTROS_PADRAO })
    setMenuAberto(false)
    setErroExport('')
  }

  async function exportar(formato) {
    setMenuAberto(false)
    setErroExport('')
    setExportando(true)
    try {
      const blob = await api.exportOrders({ formato, ...parametros(filtros) })
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

      <form className="filters rel-filtros" onSubmit={(evento) => evento.preventDefault()}>
        <div className="rel-filtro">
          <label htmlFor="filtro-status">Status</label>
          <select id="filtro-status" name="status" disabled={carregamentoInicial} value={filtros.status} onChange={alterarFiltro}>
            <option value="">Todos</option>
            {STATUS.map(([status]) => <option key={status}>{status}</option>)}
          </select>
        </div>

        <div className="rel-filtro">
          <label htmlFor="filtro-responsavel">Responsável</label>
          <select id="filtro-responsavel" name="responsavel" disabled={carregamentoInicial} value={filtros.responsavel} onChange={alterarFiltro}>
            <option value="">Todos</option>
            {responsaveis.map((nome) => <option key={nome}>{nome}</option>)}
          </select>
        </div>

        <div className="rel-filtro">
          <label htmlFor="filtro-dataInicio">Aberta a partir de</label>
          <input id="filtro-dataInicio" type="date" name="dataInicio" disabled={carregamentoInicial} value={filtros.dataInicio} onChange={alterarFiltro} />
        </div>

        <div className="rel-filtro">
          <label htmlFor="filtro-dataFim">Aberta até</label>
          <input id="filtro-dataFim" type="date" name="dataFim" disabled={carregamentoInicial} value={filtros.dataFim} onChange={alterarFiltro} />
        </div>

        <button type="button" className="btn-outline" onClick={limparFiltros}>Limpar Filtros</button>
      </form>

      {!erro && !intervaloInvalido && (
        <>
          <div className="rel-tipo-grafico" role="group" aria-label="Tipo de gráfico">
            <button type="button" aria-pressed={!pizza} onClick={() => setPizza(false)}>Barras</button>
            <button type="button" aria-pressed={pizza} onClick={() => setPizza(true)}>Pizza</button>
          </div>
          <div className="rel-graficos" aria-busy={carregando}>
            <GraficoOrdens titulo="Ordens por status" ordens={ordensGrafico} campo="status" categorias={STATUS} pizza={pizza} />
            <GraficoOrdens titulo="Ordens por prioridade" ordens={ordensGrafico} campo="priority" categorias={PRIORIDADES} pizza={pizza} />
            <GraficoOrdens titulo="Ordens por responsável" ordens={ordensGrafico} campo="responsavelId"
              categorias={categoriasPorResponsavel(ordensGrafico)} pizza={pizza} />
          </div>
        </>
      )}

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
            {!carregando && erro && <tr><td colSpan={7}><span role="alert">{erro}</span></td></tr>}
            {!carregando && !erro && ordens.length === 0 && (
              <tr><td colSpan={7}>Nenhuma ordem encontrada.</td></tr>
            )}
            {!carregando && !erro && ordens.map((o) => (
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
          <span>{ordens.length} de {totalOrdens ?? 0} ordens</span>

          <div className="rel-export">
            <button
              className="btn-outline"
              disabled={carregando || exportando || Boolean(erro) || intervaloInvalido}
              onClick={() => setMenuAberto((v) => !v)}
            >
              {exportando ? 'Exportando…' : 'Exportar ▾'}
            </button>
            {menuAberto && (
              <div className="rel-export-menu">
                <button onClick={() => exportar('csv')}>CSV</button>
                <button onClick={() => exportar('xlsx')}>Excel (.xlsx)</button>
                <button onClick={() => exportar('pdf')}>PDF (.pdf)</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
