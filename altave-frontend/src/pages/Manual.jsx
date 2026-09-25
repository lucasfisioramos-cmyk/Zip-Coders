import { IconBox, IconBook, IconCode } from '../components/icons.jsx'

const CARDS = [
  { Icon: IconBox, title: 'Manual de instalação', desc: 'Passo a passo para implantar o sistema em ambiente de homologação, incluindo pré-requisitos e configuração inicial.' },
  { Icon: IconBook, title: 'Manual de uso', desc: 'Guia rápido para colaboradores: como abrir, acompanhar, filtrar e encerrar ordens de serviço no quadro Kanban.' },
  { Icon: IconCode, title: 'Documentação da API', desc: 'Referência Swagger com todos os endpoints disponíveis para integração de sistemas de terceiros.' },
]

export default function Manual() {
  return (
    <div className="page">
      <h1>Manual & API</h1>
      <p className="page-sub">Documentação de instalação, uso do sistema e integração via API.</p>

      <div className="manual-grid">
        {CARDS.map((c) => (
          <div className="manual-card" key={c.title}>
            <div className="manual-icon"><c.Icon /></div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <a href="#">Consultar documentação →</a>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <img src="/altave-logo.png" alt="Altave" className="manual-footer-logo" />
      </div>
    </div>
  )
}
