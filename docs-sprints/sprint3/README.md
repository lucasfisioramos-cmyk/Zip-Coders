# Documentação - Sprint 3

> Status da Sprint: 

## Desafio

Consolidar a aplicação de Gestão de Ordens de Serviço, focando na inteligência de dados operacionais, segurança de acessos internos, agilidade nas consultas e consolidação do ambiente de testes e suporte.

Nesta sprint, o sistema apresenta funcionalidades essenciais como a geração de relatórios gerenciais (de ordens abertas, em andamento e concluídas) com opções de exportação em PDF e Excel para compartilhamento na equipe interna, a configuração de perfis de acesso estritamente internos (usuário padrão, executor, gestor e administrador) para garantir total segurança da plataforma, e filtros avançados de pesquisa (por responsável, prazo e status) para agilizar o atendimento. Além disso, a entrega contempla a personalização de notificações corporativas e a estruturação do ambiente de homologação para testes controlados.

O foco desta última etapa é entregar uma plataforma robusta, segura e totalmente adaptada à governança e às análises de desempenho da equipe interna.
---

## Backlog da Sprint

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :--- | :--- | :--- | :--- | :--- |
| 12 | Média | Como gestor, quero relatórios de ordens abertas, em andamento e concluídas, para análise de desempenho. | 8 pontos | 3 |
| 13 | Média | Como administrador, quero configurar perfis de acesso focados em **uso estritamente interno** (usuário padrão, executor, gestor, administrador), para garantir segurança sem expor a plataforma a clientes. | 8 pontos | 3 |
| 14 | Baixa | Como **usuário interno**, quero pesquisar ordens por filtros avançados (responsável, prazo, status), para agilizar consultas. | 5 pontos | 3 |
| 15 | Baixa | Como gestor, quero exportar relatórios em PDF/Excel, para compartilhar com a **equipe interna** (visto que nenhum cliente terá acesso ao sistema). | 5 pontos | 3 |
| 16 | Baixa | Como administrador, quero configurar notificações personalizadas, para adequar às necessidades da empresa. | 8 pontos | 3 |
| 17 | Baixa | Como sistema, devo suportar ambiente de homologação com capacidade limitada, para testes controlados. | 5 pontos | 3 |

---

## DoR - Definition of Ready

| Critério | Descrição |
|---------|----------|
| Clareza na Descrição | A User Story descreve claramente a funcionalidade relacionada aos dados dos deputados. |
| Critérios de Aceitação Definidos | Estão definidos critérios como exibição correta de dados, funcionamento da busca e carregamento das informações. |
| Cenários de Teste Especificados | Existem cenários de teste para validar funcionalidades como listagem, busca e visualização de dados. |
| Independente | A funcionalidade pode ser desenvolvida sem depender de outra da Sprint. |
| Compreensão Compartilhada | A equipe entende como os dados devem ser exibidos e utilizados no sistema. |
| Estimável | A história possui estimativa baseada na complexidade da funcionalidade. |
| Documentos de Apoio | Protótipos (Figma) ou referências das telas estão disponíveis. |

---

## DoD - Definition of Done

| Critério | Descrição |
|---------|----------|
| Critérios de Aceitação atendidos | A funcionalidade atende aos critérios definidos, como exibição correta dos dados e funcionamento esperado. |
| Testes manuais | Funcionalidades como busca, listagem e visualização foram testadas manualmente. |
| Código revisado | O código foi revisado pela equipe. |
| Documentação interna atualizada | Atualizações, estrutura de dados ou funcionalidades foram documentadas e atualizadas no Jira. |
| Integração com outras partes | A comunicação entre frontend e backend foi validada e a aplicação continua funcionando corretamente após a implementação. |
| Validação do PO | O Product Owner valida se os dados apresentados atendem ao objetivo do sistema. |


## Equipe

|      Função      | Nome    |                                                                                                                                                                                                     LinkedIn & GitHub                                                                                                                                                                                                      |
| :--------------: | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| PO | Nícolas | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/nicolas-de-oliveira-malibu/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BFXfajZQTSFax%2FNbt25%2BMuw%3D%3D) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/NicolasXy) |
| SM |  Lucas | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-lemes-ramos-9a9661251/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](hhttps://github.com/lucasfisioramos-cmyk)                                           |
| Dev team | Pedro | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/pedro-augusto-davies-gon%C3%A7alves-4554293b0/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/daviespedro)                                                                  |
| Dev team | Matheus | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/matheus-silva-274a19310/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Matheusxfc)                                                                      |
| Dev team  | Heitor | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/heitor-da-hora-206051400/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/heitorhora)                                                                      |
| Dev team  | Daniel | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/danielandradefatec)                                                                       |
