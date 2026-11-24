import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import NovoUsuarioModal from '../components/NovoUsuarioModal.jsx'

export default function Usuarios({ user }) {
  const perfilAtual = user?.perfil
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [perfis, setPerfis] = useState([])
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(null)
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let ativa = true
    setLoading(true)
    setErro('')
    setDrafts({})
    Promise.all([api.listUsers(), api.profiles()])
      .then(([users, roles]) => {
        if (!ativa) return
        setUsuarios(users)
        setPerfis(roles)
      })
      .catch((err) => {
        if (ativa) setErro(err.response?.data?.erro || 'Não foi possível carregar os usuários.')
      })
      .finally(() => { if (ativa) setLoading(false) })
    return () => { ativa = false }
  }, [perfilAtual])

  async function handleCreate(form) {
    const novo = await api.createUser(form)
    setUsuarios((prev) => [novo, ...prev])
    setSuccess(`Usuário ${novo.name} cadastrado.`)
    setShowModal(false)
  }

  async function atualizarUsuario(usuario, { perfil, ativo }) {
    setSaving(usuario.id)
    setErro('')
    setSuccess('')
    try {
      const atualizado = perfil
        ? await api.updateUserRole(usuario.id, perfil)
        : await api.updateUserStatus(usuario.id, ativo)
      setUsuarios((prev) => prev.map((row) => row.id === usuario.id ? atualizado : row))
      if (perfil) {
        setDrafts((prev) => ({ ...prev, [usuario.id]: undefined }))
        setSuccess(`Perfil de ${atualizado.name} atualizado.`)
      } else {
        setSuccess(`Acesso de ${atualizado.name} ${ativo ? 'reativado' : 'desativado'}.`)
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível atualizar o usuário.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Usuários</h1>
          <p className="page-sub">Gerencie quem tem acesso ao sistema.</p>
        </div>
        <button className="btn-new" disabled={loading || !perfis.length || saving !== null}
          onClick={() => { setErro(''); setSuccess(''); setShowModal(true) }}>+ Novo usuário</button>
      </div>

      {erro && <div className="login-error" style={{ marginBottom: 18 }}>{erro}</div>}

      {success && <p role="status">{success}</p>}
      {loading ? (
        <p className="page-sub">Carregando usuários...</p>
      ) : (
        <div className="table-card usuarios-table">
          <table>
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Ações</th></tr>
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
                    {u.podeGerenciar && perfis.length > 0 ? (
                      <div className="usuarios-perfil">
                        <select aria-label={`Perfil de ${u.name}`} value={drafts[u.id] ?? u.perfil}
                          disabled={saving !== null} onChange={(e) => setDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}>
                          {perfis.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <button className="btn-outline" aria-label={`Salvar perfil de ${u.name}`}
                          disabled={saving !== null || !drafts[u.id] || drafts[u.id] === u.perfil}
                          onClick={() => atualizarUsuario(u, { perfil: drafts[u.id] })}>Salvar</button>
                      </div>
                    ) : u.role}
                  </td>
                  <td>
                    <span className="status-pill">
                      <span className="dot" style={{ background: u.ativo ? '#1F9D55' : '#8A94A3' }} />
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    {u.podeGerenciar && (
                      <button className="btn-outline" disabled={saving !== null}
                        aria-label={`${u.ativo ? 'Desativar' : 'Reativar'} acesso de ${u.name}`}
                        onClick={() => atualizarUsuario(u, { ativo: !u.ativo })}>
                        {u.ativo ? 'Desativar' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <NovoUsuarioModal perfis={perfis} onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}
