# Aprendizado por Projeto Integrado (API) - 2º DSM 

CRU Avançado Web, Requisitos não funcionais levando em conta a Arquitetura da Solução (Linguagem OO, BD Relacional) e Ambiente de homologação com capacidade limitada para o cliente Tema definido na matriz de competências do semestre do curso, no campo “produto sem contexto”

---
# Índice
* [Objetivo do Projeto](#objetivo-do-projeto)
* [Equipe](#Equipe)
* [Backlog do produto](#Product-Backlog)
* [Competências desenvolvidas](#competências-desenvolvidas)
* [Registro das Sprints](#Registro-das-Sprints)

---
# Projeto (API) 

## Sistema para Ordens de Serviço
Sistema de gestão de ordens de serviço, permitindo abertura, acompanhamento e encerramento de solicitações de manutenção ou serviço. O sistema deve manter um histórico completo de cada ordem, incluindo status, responsáveis e prazos, facilitando a rastreabilidade e a comunicação entre solicitantes e executantes. Também deve permitir a priorização de solicitações conforme urgência ou criticidade.

---
# Equipe
|      Função      | Nome    |                                                                                                                                                                                                     LinkedIn & GitHub                                                                                                                                                                                                      |
| :--------------: | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Nicolas PO    | Aluno 1 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/nicolas-de-oliveira-malibu/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BFXfajZQTSFax%2FNbt25%2BMuw%3D%3D) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/NicolasXy) |
|     Lucas SM     | Aluno 2 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-lemes-ramos-9a9661251/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](hhttps://github.com/lucasfisioramos-cmyk)                                           |
|   Pedro DEV 1    | Aluno 3 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/pedro-augusto-davies-gon%C3%A7alves-4554293b0/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/daviespedro)                                                                  |
| Matheus Dev team | Aluno 4 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/matheus-silva-274a19310/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/Matheusxfc)                                                                      |
| Heitor Dev team  | Aluno 5 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/heitor-da-hora-206051400/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/heitorhora)                                                                      |
| Daniel Dev team  | Aluno 6 | [![Linkedin Badge](https://img.shields.io/badge/Linkedin-blue?style=flat-square&logo=Linkedin&logoColor=white)](https://www.linkedin.com/in/) [![GitHub Badge](https://img.shields.io/badge/GitHub-111217?style=flat-square&logo=github&logoColor=white)](https://github.com/danielandradefatec)                                                                       |

---
# Requisitos não funcionais 
- Manual de Instalação (requisito Fatec – obrigatório, no Git);
- Manual do Usuário (requisito Fatec – obrigatório);
- Documentação da API, podendo ser um Swagger;
- Rastreabilidade das operações feitas na aplicação;
- Notificação para que os envolvidos saibam de mudanças relevantes na ordem;
- Interface intuitiva e amigável, garantindo fácil adoção pelos usuários no uso

---
## Conhecimentos 
- Documentação de Software (Briefing, User Stories, Wireframes, Casos de Testes
Funcionais, Requisitos Não Funcionais);
- Estimativa e Relatório de Esforço;
- Usabilidade - UX/UI;
- Fundamentos de Sistemas Web;
- Programação Orientada a Objetos (Web);
- Mapeamento Objeto Relacional;
- Arquitetura de Software;
- Programação com Estruturas de Dados;
- Documentação de Software (API, Rotas);
- BD Relacional (Requisito Fatec);
- HTML, Javascript, CSS (Requisito Fatec);
- Linguagem Typescript e NodeJS (Sugestão Fatec).
- Linguagem Typescript e NodeJS (Sugestão Fatec).

---
# Product Backlog

### Product Backlog Atualizado

| Rank | Prioridade | User Story | Estimativa | Sprint |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Alta | Como **usuário interno**, quero abrir uma ordem de serviço com descrição, prioridade e responsável, para iniciar o processo de manutenção sem depender de um perfil restrito e evitar gargalos. | 8 pontos | 1 |
| 2 | Alta | Como **executor ou gestor responsável**, quero atualizar o status da ordem (em andamento, concluída, etc.) em um **quadro Kanban**, para manter o acompanhamento transparente e visual. | 5 pontos | 1 |
| 3 | Alta | Como **gestor ou executor responsável**, quero encerrar uma ordem de serviço com registro de data e responsável, para garantir rastreabilidade e flexibilidade na condução. | 5 pontos | 1 |
| 4 | Alta | Como **usuário interno**, quero consultar o histórico completo de uma ordem, para verificar todas as alterações realizadas. | 8 pontos | 2 |
| 5 | Alta | Como sistema, devo notificar os envolvidos quando houver mudanças relevantes na ordem, para garantir comunicação eficiente. | 8 pontos | 2 |
| 6 | Alta | Como administrador, quero manual de instalação disponível no Git, para facilitar implantação em ambiente de homologação. | 3 pontos | 1 |
| 7 | Alta | Como **usuário interno**, quero manual de uso acessível, para aprender rapidamente a utilizar o sistema. | 3 pontos | 1 |
| 8 | Alta | Como desenvolvedor, quero documentação da API (Swagger), para integrar facilmente com outros sistemas. | 5 pontos | 2 |
| 9 | Média | Como gestor, quero definir prioridades nas ordens de serviço (urgência/criticidade), para otimizar recursos. | 8 pontos | 3 |
| 10 | Média | Como sistema, devo registrar rastreabilidade das operações (log de auditoria), para garantir confiabilidade. | 8 pontos | 3 |
| 11 | Média | Como **usuário interno**, quero uma interface intuitiva **baseada no método Kanban**, para visualizar o fluxo de trabalho de forma clara e reduzir a curva de aprendizado. | 13 pontos | 3 |
| 12 | Média | Como gestor, quero relatórios de ordens abertas, em andamento e concluídas, para análise de desempenho. | 8 pontos | 4 |
| 13 | Média | Como administrador, quero configurar perfis de acesso focados em **uso estritamente interno** (usuário padrão, executor, gestor, administrador), para garantir segurança sem expor a plataforma a clientes. | 8 pontos | 4 |
| 14 | Baixa | Como **usuário interno**, quero pesquisar ordens por filtros avançados (responsável, prazo, status), para agilizar consultas. | 5 pontos | 5 |
| 15 | Baixa | Como gestor, quero exportar relatórios em PDF/Excel, para compartilhar com a **equipe interna** (visto que nenhum cliente terá acesso ao sistema). | 5 pontos | 5 |
| 16 | Baixa | Como administrador, quero configurar notificações personalizadas, para adequar às necessidades da empresa. | 8 pontos | 6 |
| 17 | Baixa | Como sistema, devo suportar ambiente de homologação com capacidade limitada, para testes controlados. | 5 pontos | 6 |
---

# Registro das Sprints

| Sprint            | Previsão   | Status   | Histórico |
|-------------------|------------|----------|-----------|
| 01                | dd/mm/aaaa | a fazer  | [MVP](MVP/sp1.md)  |
| 02                | dd/mm/aaaa | a fazer  | [MVP](MVP/sp2.md)  |
| 03                | dd/mm/aaaa | a fazer  | [MVP](MVP/sp3.md)  |
| Feira de Soluções | dd/mm/aaaa | a fazer  | [MVP](#)  |
