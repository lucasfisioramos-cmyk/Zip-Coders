// Linha do tempo da OS. Componente puro: recebe os eventos da API e só desenha.

export function tituloEvento(e) {
  switch (e.tipo) {
    case 'criacao': return e.para === 'Aberta' ? 'Ordem criada' : `Ordem registrada como ${e.para}`
    case 'encerramento': return 'Ordem encerrada'
    case 'edicao': return 'Ordem editada'
    case 'reabertura': return `Ordem reaberta como ${e.para}`
    default: return `Movida de ${e.de} para ${e.para}`
  }
}

export function formatarData(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function HistoricoTimeline({ eventos }) {
  if (!eventos || eventos.length === 0) {
    return <div className="kcol-empty">Esta ordem não tem registros de histórico.</div>
  }

  return (
    <ol className="timeline">
      {eventos.map((e) => (
        <li key={e.id} className={`tl-item tl-${e.tipo}`}>
          <span className="tl-dot" aria-hidden="true" />
          <div className="tl-body">
            <div className="tl-title">{tituloEvento(e)}</div>
            <div className="tl-meta">
              <span className="kavatar tl-avatar" style={{ background: e.avatarColor }}>{e.avatar}</span>
              <span>{e.quem}</span>
              <time dateTime={e.em}>{formatarData(e.em)}</time>
            </div>
            {e.observacao && (
              <div className="tl-obs">
                <span className="tl-obs-label">{e.tipo === 'encerramento' ? 'Solução aplicada' : e.tipo === 'edicao' ? 'Alterações' : 'Observação'}</span>
                {e.observacao}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
