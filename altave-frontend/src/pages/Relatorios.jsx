import { INITIAL_ORDERS, TOTAL_ORDERS_COUNT } from '../data/mockData.js'

export default function Relatorios() {
  const rows = INITIAL_ORDERS

  return (
    <div className="page">
      <h1>Relatórios</h1>
      <p className="page-sub">Consulte e exporte o histórico de ordens de serviço.</p>

      <div className="filters">
        <select><option>Status: todos</option></select>
        <select><option>Responsável: todos</option></select>
        <select><option>Período: últimos 30 dias</option></select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>OS</th><th>Título</th><th>Prioridade</th><th>Responsável</th><th>Status</th><th>Aberta em</th><th>Concluída em</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td><span className={`badge ${o.priority}`}>{o.priority}</span></td>
                <td>{o.responsavel}</td>
                <td>
                  <span className="status-pill">
                    <span className={`dot ${o.status.replace(' ', '.')}`} />
                    {o.status}
                  </span>
                </td>
                <td>{o.abertaEm}</td>
                <td>{o.concluidaEm || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-foot">
          <span>{rows.length} de {TOTAL_ORDERS_COUNT} ordens</span>
          <div>
            <button className="btn-outline">Exportar PDF</button>
            <button className="btn-outline">Exportar Excel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
