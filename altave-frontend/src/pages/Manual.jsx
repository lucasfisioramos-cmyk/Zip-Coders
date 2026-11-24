import { IconBox, IconBook, IconCode } from '../components/icons.jsx'
import { API_DOCS_URL } from '../services/api.js'

const REPO_URL = 'https://github.com/lucasfisioramos-cmyk/Zip-Coders'
const DOCS_URL = `${REPO_URL}/blob/main/docs`

const CARDS = [
  { Icon: IconBox, title: 'Manual de instalação', href: `${DOCS_URL}/instalacao.md`, desc: 'Passo a passo para implantar o sistema em ambiente de homologação, incluindo pré-requisitos e configuração inicial.' },
  { Icon: IconBook, title: 'Manual de uso', href: `${DOCS_URL}/manual-de-uso.md`, desc: 'Guia rápido para colaboradores: como abrir, acompanhar, filtrar e encerrar ordens de serviço no quadro Kanban.' },
  {
    Icon: IconCode,
    title: 'Documentação da API',
    href: API_DOCS_URL,
    linkLabel: 'Abrir Swagger',
    repo: REPO_URL,
    desc: 'Consulte e teste as rotas da API no Swagger. O código-fonte está no GitHub.',
  },
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
            <div className="manual-links">
              <a href={c.href} target="_blank" rel="noopener noreferrer">{c.linkLabel ?? `Abrir ${c.title.toLowerCase()}`} →</a>
              {c.repo && <a href={c.repo} target="_blank" rel="noopener noreferrer">Ver no GitHub →</a>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <img src="/altave-logo.png" alt="Altave" className="manual-footer-logo" />
      </div>
    </div>
  )
}
