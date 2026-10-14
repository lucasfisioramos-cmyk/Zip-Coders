import { useState } from 'react'
import { api } from '../services/api.js'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { token, user } = await api.login(email, senha)
      localStorage.setItem('altave_token', token)
      onLogin(user)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src="/altave-logo.png" alt="Altave" className="login-logo-img" />
        <h1 className="login-title">Central de Ordens de Serviço</h1>
        <p className="login-sub">Acesso interno para abertura, execução e acompanhamento das ordens de manutenção.</p>

        {erro && <div className="login-error">{erro}</div>}

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@altave.com" autoFocus />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="login-foot">
          Sistema de uso estritamente interno.<br />
          Em caso de dúvidas, consulte o manual ou fale com o administrador.
        </p>
      </form>
    </div>
  )
}
