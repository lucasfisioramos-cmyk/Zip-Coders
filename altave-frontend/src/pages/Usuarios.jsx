import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import NovoUsuarioModal from '../components/NovoUsuarioModal.jsx'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    setErro('')
    try {
      setUsuarios(await api.listUsers())
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível carregar os usuários.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(form) {
    const novo = await api.createUser(form)
    setUsuarios((prev) => [novo, ...prev])
    setShowModal(false)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Usuários</h1>
          <p className="page-sub">Gerencie quem tem acesso ao sistema.</p>
        </div>
        <button className="btn-new" onClick={() => setShowModal(true)}>+ Novo usuário</button>
      </div>

      {erro && <div className="login-error" style={{ marginBottom: 18 }}>{erro}</div>}

      {loading ? (
        <p className="page-sub">Carregando usuários...</p>
      ) : (
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th></tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="kavatar" style={{ background: u.avatarColor }}>{u.avatar}</span>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className="status-pill">
                      <span className="dot" style={{ background: u.ativo ? '#1F9D55' : '#8A94A3' }} />
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NovoUsuarioModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}
