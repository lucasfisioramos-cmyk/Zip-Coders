import { useState } from 'react'

export default function NovoUsuarioModal({ perfis, onClose, onCreate }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'EXECUTOR' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setErro('')
    if (!form.nome.trim() || !form.email.trim() || !form.senha) {
      setErro('Preencha nome, email e senha.')
      return
    }
    if (form.senha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    setLoading(true)
    try {
      await onCreate(form)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível cadastrar o usuário.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="novo-usuario-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 id="novo-usuario-titulo">Novo usuário</h2>
            <p>Cadastre um novo acesso ao sistema.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {erro && <div className="login-error">{erro}</div>}

            <div className="field">
              <label htmlFor="novo-usuario-nome">Nome completo</label>
              <input id="novo-usuario-nome" maxLength={100} placeholder="Ex: Maria Souza" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="novo-usuario-email">Email</label>
              <input id="novo-usuario-email" maxLength={100} type="email" placeholder="maria.souza@altave.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="modal-row">
              <div className="field">
                <label htmlFor="novo-usuario-senha">Senha</label>
                <input id="novo-usuario-senha" autoComplete="new-password" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={(e) => set('senha', e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="novo-usuario-perfil">Perfil</label>
                <select id="novo-usuario-perfil" value={form.perfil} onChange={(e) => set('perfil', e.target.value)}>
                  {perfis.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary btn-inline" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
