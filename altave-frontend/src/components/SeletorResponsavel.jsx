export default function SeletorResponsavel({ id, value, onChange, usuarios, carregando, erro, atual }) {
  const responsavelIndisponivel = atual?.id && !usuarios.some((u) => u.id === atual.id)

  return (
    <>
      <label htmlFor={id}>Responsável</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} disabled={carregando || Boolean(erro)}>
        <option value="">Não atribuído</option>
        {responsavelIndisponivel && <option value={atual.id} disabled>{atual.nome}</option>}
        {usuarios.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
      </select>
      {carregando && <small>Carregando responsáveis…</small>}
      {erro && <small role="alert">{erro}</small>}
    </>
  )
}
