import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import NovaOrdemModal from '../components/NovaOrdemModal.jsx'
import { IconCalendar } from '../components/icons.jsx'

const COLUMNS = [
  { key: 'Aberta', label: 'Aberta', dot: '#9aa4b2' },
  { key: 'Em andamento', label: 'Em andamento', dot: '#3f7fc1' },
  { key: 'Concluída', label: 'Concluída', dot: '#1f9d55' },
]

const AVATAR_FALLBACK = { CD: '#2E86D8', JP: '#D99A2B', AF: '#1F9D55', '?': '#8A94A3' }

export default function Kanban({ user }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    setErro('')
    try {
      const data = await api.listOrders()
      setOrders(data)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível carregar as ordens. Verifique se o backend está no ar.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter((o) =>
    o.title.toLowerCase().includes(busca.toLowerCase()) || o.id.toLowerCase().includes(busca.toLowerCase())
  )

  async function moveOrder(id, newStatus) {
    const anterior = orders
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))) // otimista
    try {
      const atualizado = await api.updateOrderStatus(id, newStatus)
      setOrders((prev) => prev.map((o) => (o.id === id ? atualizado : o)))
    } catch (err) {
      setOrders(anterior) // desfaz se a API falhar
      setErro(err.response?.data?.erro || 'Não foi possível mover a ordem.')
    }
  }

  function handleDrop(colKey) {
    if (dragId) moveOrder(dragId, colKey)
    setDragId(null)
    setOverCol(null)
  }

  async function handleCreate(form) {
    try {
      const nova = await api.createOrder(form)
      setOrders((prev) => [nova, ...prev])
      setShowModal(false)
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível criar a ordem.')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Quadro Kanban</h1>
          <p className="page-sub">Acompanhe o andamento de todas as ordens de serviço abertas. Arraste um card para mudar o status ou reordenar.</p>
        </div>
        <button className="btn-new" onClick={() => setShowModal(true)}>+ Nova ordem</button>
      </div>

      {erro && <div className="login-error" style={{ marginBottom: 18 }}>{erro}</div>}

      <div className="filters">
        <input placeholder="Buscar por título ou número da OS" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select><option>Responsável: todos</option></select>
        <select><option>Prioridade: todas</option></select>
        <select><option>Prazo: qualquer</option></select>
      </div>

      {loading ? (
        <p className="page-sub">Carregando ordens...</p>
      ) : (
        <div className="kanban">
          {COLUMNS.map((col) => {
            const items = filtered.filter((o) => o.status === col.key)
            const isOver = overCol === col.key
            return (
              <div
                key={col.key}
                className={`kcol${isOver ? ' drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (overCol !== col.key) setOverCol(col.key) }}
                onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="kcol-head">
                  <span className="status-dot" style={{ background: col.dot }} />
                  {col.label}
                  <span className="count">{items.length}</span>
                </div>

                {items.map((o) => (
                  <div
                    key={o.id}
                    className={`kcard${dragId === o.id ? ' dragging' : ''}`}
                    draggable
                    onDragStart={() => setDragId(o.id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null) }}
                  >
                    <div className="kcard-top">
                      <span className="kcard-id">{o.id}</span>
                      <span className={`badge ${o.priority}`}>{o.priority}</span>
                    </div>
                    <div className="kcard-title">{o.title}</div>
                    {col.key !== 'Concluída' ? (
                      <div className={`kcard-meta ${o.vencida ? 'vencida' : ''}`}>
                        <IconCalendar /> {o.vencida ? `Vencida em ${o.prazo}` : `Prazo: ${o.prazo || '—'}`}
                      </div>
                    ) : (
                      <div className="kcard-meta done">{o.agingLabel}</div>
                    )}
                    <div className="kcard-bottom">
                      {col.key !== 'Concluída' && <span className="kcard-aging">{o.agingLabel}</span>}
                      <span className="kavatar" style={{ background: o.avatarColor || AVATAR_FALLBACK[o.avatar] || '#9aa4b2', marginLeft: 'auto' }}>{o.avatar}</span>
                    </div>
                  </div>
                ))}

                {isOver && <div className="kdrop-placeholder">Soltar aqui</div>}
                {items.length === 0 && !isOver && <div className="kcol-empty">Nenhuma ordem</div>}
              </div>
            )
          })}
        </div>
      )}

      {showModal && <NovaOrdemModal user={user} onClose={() => setShowModal(false)} onCreate={handleCreate} />}
    </div>
  )
}
