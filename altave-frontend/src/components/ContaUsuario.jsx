import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'
import './ContaUsuario.css'

export default function ContaUsuario({ user, onLogout, onProfileChange }) {
  const podeEditar = ['EXECUTOR', 'GESTOR'].includes(user.perfil)
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const conta = useRef(null)
  const botao = useRef(null)

  useEffect(() => {
    if (!podeEditar || !aberto || salvando) return
    function fecharFora(evento) {
      if (!conta.current.contains(evento.target)) setAberto(false)
    }
    function fecharComEscape(evento) {
      if (evento.key !== 'Escape') return
      setAberto(false)
      botao.current?.focus()
    }
    document.addEventListener('pointerdown', fecharFora)
    document.addEventListener('keydown', fecharComEscape)
    return () => {
      document.removeEventListener('pointerdown', fecharFora)
      document.removeEventListener('keydown', fecharComEscape)
    }
  }, [podeEditar, aberto, salvando])

  function abrirOuFechar() {
    if (!podeEditar) return onLogout()
    if (salvando) return
    setEditando(false)
    setErro('')
    setMensagem('')
    setAberto((anterior) => !anterior)
  }

  async function salvarNome(evento) {
    evento.preventDefault()
    const novoNome = nome.trim()
    if (salvando || !novoNome || novoNome === user.name) return
    setSalvando(true)
    setErro('')
    try {
      const perfil = await api.updateOwnName(novoNome)
      onProfileChange(perfil)
      setEditando(false)
      setMensagem('Nome atualizado.')
      botao.current?.focus()
    } catch (falha) {
      setErro(falha.response?.data?.erro || 'Não foi possível atualizar o nome.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="conta-usuario" ref={conta}>
      <button
        ref={botao}
        className="user"
        type="button"
        onClick={abrirOuFechar}
        aria-label={podeEditar ? `Minha conta, ${user.name}` : `Sair da conta de ${user.name}`}
        aria-expanded={podeEditar ? aberto : undefined}
        aria-controls={podeEditar && aberto ? 'painel-conta' : undefined}
      >
        <span className="user-name">{user.name}</span>
        <span className="avatar" aria-hidden="true" style={{ background: user.color }}>{user.id}</span>
      </button>
      {podeEditar && aberto && (
        <section id="painel-conta" className="conta-usuario-painel" aria-label="Minha conta">
          <div className="conta-usuario-identidade">
            <span className="avatar" aria-hidden="true" style={{ background: user.color }}>{user.id}</span>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          {mensagem && <p className="conta-usuario-mensagem" role="status">{mensagem}</p>}

          {editando ? (
            <form onSubmit={salvarNome}>
              <div className="field">
                <label htmlFor="conta-usuario-nome">Nome</label>
                <input id="conta-usuario-nome" autoComplete="name" autoFocus maxLength={100} required
                  disabled={salvando} value={nome} onChange={(evento) => setNome(evento.target.value)} />
              </div>
              {erro && <p className="login-error" role="alert">{erro}</p>}
              <div className="conta-usuario-acoes">
                <button className="btn-secondary" type="button" disabled={salvando}
                  onClick={() => { setEditando(false); botao.current?.focus() }}>Cancelar</button>
                <button className="btn-primary btn-inline" type="submit"
                  disabled={salvando || !nome.trim() || nome.trim() === user.name}>
                  {salvando ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="conta-usuario-acoes">
              <button className="btn-secondary" type="button" onClick={() => {
                setNome(user.name)
                setErro('')
                setMensagem('')
                setEditando(true)
              }}>Editar nome</button>
              <button className="btn-secondary conta-usuario-sair" type="button" onClick={onLogout}>Sair</button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
