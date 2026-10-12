# Documentação - Sprint 1

> Status da Sprint: Finalizada 

## Desafio

Desenvolver a base da aplicação de Gestão de Ordens de Serviço, permitindo a abertura, o acompanhamento do fluxo de trabalho e a rastreabilidade completa dos atendimentos de manutenção de forma clara e acessível.

Nesta sprint, o sistema apresenta funcionalidades essenciais como abertura de ordens de serviço (com descrição, prioridade e responsável), acompanhamento visual através de um quadro Kanban para atualização de status, encerramento formal de chamados e consulta ao histórico detalhado de alterações. Além disso, o sistema conta com notificações automáticas de mudanças relevantes para os envolvidos e disponibiliza manuais de uso e de instalação no Git para homologação.

O foco está na organização das informações de forma intuitiva e transparente, eliminando gargalos operacionais e facilitando a comunicação entre gestores, executores e usuários internos.

---

## Backlog da Sprint

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Alta | Como **usuário interno**, quero abrir uma ordem de serviço com descrição, prioridade e responsável, para iniciar o processo de manutenção sem depender de um perfil restrito e evitar gargalos. | 8 pontos | 1 |
| 2 | Alta | Como **executor ou gestor responsável**, quero atualizar o status da ordem (em andamento, concluída, etc.) em um **quadro Kanban**, para manter o acompanhamento transparente e visual. | 5 pontos | 1 |
| 3 | Alta | Como **gestor ou executor responsável**, quero encerrar uma ordem de serviço com registro de data e responsável, para garantir rastreabilidade e flexibilidade na condução. | 5 pontos | 1 |
| 4 | Alta | Como **usuário interno**, quero consultar o histórico completo de uma ordem, para verificar todas as alterações realizadas. | 8 pontos | 1 |
| 5 | Alta | Como sistema, devo notificar os envolvidos quando houver mudanças relevantes na ordem, para garantir comunicação eficiente. | 8 pontos | 1 |
| 6 | Alta | Como administrador, quero manual de instalação disponível no Git, para facilitar implantação em ambiente de homologação. | 3 pontos | 1 |
| 7 | Alta | Como **usuário interno**, quero manual de uso acessível, para aprender rapidamente a utilizar o sistema. | 3 pontos | 1 |

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