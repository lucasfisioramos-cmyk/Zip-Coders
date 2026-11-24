import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { BellIcon } from './icons.jsx'
import { formatarData, tituloEvento } from './HistoricoTimeline.jsx'
import './Notificacoes.css'

export default function Notificacoes() {
  const [aberto, setAberto] = useState(false)
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState('')
  const [marcando, setMarcando] = useState(false)
  const painel = useRef(null)
  const sino = useRef(null)
  const requisicao = useRef(0)

  const carregar = useCallback(async () => {
    const atual = ++requisicao.current
    try {
      const resultado = await api.listNotifications()
      if (atual === requisicao.current) {
        setDados(resultado)
        setErro('')
      }
    } catch {
      if (atual === requisicao.current) setErro('Não foi possível carregar as notificações.')
    }
  }, [])

  useEffect(() => {
    carregar()
    const intervalo = window.setInterval(carregar, 15000)
    return () => {
      window.clearInterval(intervalo)
      requisicao.current += 1
    }
  }, [carregar])

  useEffect(() => {
    if (!aberto) return
    function fecharFora(evento) {
      if (!painel.current?.contains(evento.target)) setAberto(false)
    }
    function fecharTeclado(evento) {
      if (evento.key !== 'Escape') return
      setAberto(false)
      sino.current?.focus()
    }
    document.addEventListener('pointerdown', fecharFora)
    document.addEventListener('keydown', fecharTeclado)
    return () => {
      document.removeEventListener('pointerdown', fecharFora)
      document.removeEventListener('keydown', fecharTeclado)
    }
  }, [aberto])

  async function marcarLidas(ids) {
    setMarcando(true)
    try {
      await api.readNotifications(ids)
      await carregar()
    } catch {
      setErro('Não foi possível marcar as notificações como lidas.')
    } finally {
      setMarcando(false)
    }
  }

  const itens = dados?.notificacoes ?? []
  const idsNaoLidas = itens.filter((item) => !item.lida).map((item) => item.id)
  const totalNaoLidas = dados?.totalNaoLidas ?? 0

  return (
    <div className="notificacoes" ref={painel}>
      <button
        ref={sino}
        className="notificacoes-sino"
        type="button"
        aria-label={totalNaoLidas ? `Notificações: ${totalNaoLidas} não lidas` : 'Notificações'}
        aria-expanded={aberto}
        aria-controls={aberto ? 'painel-notificacoes' : undefined}
        onClick={() => {
          if (!aberto) carregar()
          setAberto(!aberto)
        }}
      >
        <BellIcon aria-hidden="true" />
        {totalNaoLidas > 0 && <span aria-hidden="true">{totalNaoLidas > 99 ? '99+' : totalNaoLidas}</span>}
      </button>

      {aberto && (
        <section id="painel-notificacoes" className="notificacoes-painel" aria-labelledby="titulo-notificacoes">
          <header className="notificacoes-cabecalho">
            <h2 id="titulo-notificacoes">Notificações</h2>
            {idsNaoLidas.length > 0 && (
              <button type="button" disabled={marcando} onClick={() => marcarLidas(idsNaoLidas)}>
                Marcar exibidas como lidas
              </button>
            )}
          </header>
          {erro && <p className="notificacoes-mensagem" role="alert">{erro}</p>}
          {!dados && !erro && <p className="notificacoes-mensagem" role="status">Carregando notificações…</p>}
          {dados && itens.length === 0 && <p className="notificacoes-mensagem">Nenhuma notificação por enquanto.</p>}
          <ul className="notificacoes-lista">
            {itens.map((item) => (
              <li key={item.id}>
                <Link
                  className={item.lida ? 'notificacao' : 'notificacao notificacao-nova'}
                  to={`/historico/${encodeURIComponent(item.codigo)}`}
                  onClick={() => {
                    if (!item.lida) marcarLidas([item.id])
                    setAberto(false)
                  }}
                >
                  <strong>{tituloEvento(item)}</strong>
                  <span className="notificacao-ordem">{item.codigo} · {item.titulo}</span>
                  {item.observacao && <span className="notificacao-resumo">{item.observacao}</span>}
                  <small>{item.quem} · <time dateTime={item.em}>{formatarData(item.em)}</time></small>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
