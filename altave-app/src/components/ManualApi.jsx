import React from 'react';
import { InstallIcon, BookIcon, ApiIcon } from './Icons.jsx';

const DOCS = [
  {
    icon: InstallIcon,
    title: 'Manual de instalação',
    desc: 'Passo a passo para implantar o sistema em ambiente de homologação, incluindo pré-requisitos e configuração inicial.',
  },
  {
    icon: BookIcon,
    title: 'Manual de uso',
    desc: 'Guia rápido para colaboradores: como abrir, acompanhar, filtrar e encerrar ordens de serviço no quadro Kanban.',
  },
  {
    icon: ApiIcon,
    title: 'Documentação da API',
    desc: 'Referência Swagger com todos os endpoints disponíveis para integração de sistemas de terceiros.',
  },
];

export default function ManualApi() {
  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Manual &amp; API</h1>
          <div className="sub">Documentação de instalação, uso do sistema e integração via API.</div>
        </div>
      </div>
      <div className="doc-grid">
        {DOCS.map((doc) => {
          const Icon = doc.icon;
          return (
            <div className="doc-card" key={doc.title}>
              <div className="icon-wrap">
                <Icon />
              </div>
              <h3>{doc.title}</h3>
              <p>{doc.desc}</p>
              <a href="#">Consultar documentação →</a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
