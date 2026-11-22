import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import NovoUsuarioModal from '../components/NovoUsuarioModal.jsx'

export default function Usuarios({ user }) {
  const admin = user?.perfil === 'ADMIN'
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [perfis, setPerfis] = useState([])
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(null)
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    setErro('')
    try {
      const [users, roles] = await Promise.all([api.listUsers(), admin ? api.profiles() : Promise.resolve([])])
      setUsuarios(users)
      setPerfis(roles)
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

  async function saveRole(u) {
    setSaving(u.id); setErro(''); setSuccess('')
    try {
      const updated = await api.updateUserRole(u.id, drafts[u.id])
      setUsuarios((prev) => prev.map((row) => row.id === u.id ? updated : row))
      setSuccess(`Perfil de ${updated.name} atualizado.`)
    } catch (err) { setErro(err.response?.data?.erro || 'Não foi possível atualizar o perfil.') }
    finally { setSaving(null) }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Usuários</h1>
          <p className="page-sub">Gerencie quem tem acesso ao sistema.</p>
        </div>
        {admin && <button className="btn-new" onClick={() => setShowModal(true)}>+ Novo usuário</button>}
      </div>

      {erro && <div className="login-error" style={{ marginBottom: 18 }}>{erro}</div>}

      {success && <p role="status">{success}</p>}
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
                  <td>
                    {admin ? <>
                    <select aria-label={`Perfil de ${u.name}`} value={drafts[u.id] ?? u.perfil}
                      disabled={saving !== null} onChange={(e) => setDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}>
                      {perfis.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                    <button className="btn-outline" disabled={saving !== null || !drafts[u.id] || drafts[u.id] === u.perfil}
                      onClick={() => saveRole(u)}>Salvar</button>
                    </> : u.role}
                  </td>
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

      {admin && showModal && <NovoUsuarioModal onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}
