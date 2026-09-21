# Altave · Gestão de Ordens de Serviço

Protótipo no Figma

[Acessar Protótipo no Figma](https://www.figma.com/make/mcQgDpJewzB5mZ4RVuIVQS/Prot%C3%B3tipo?fullscreen=1&t=ML7VsGoeaTvey5mg-1&code-node-id=0-6)

Protótipo funcional (React + Vite) do sistema interno de ordens de serviço da Altave.

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar no terminal (geralmente `http://localhost:5173`).

Login de demonstração:
- **Usuário:** carlos.dias
- **Senha:** altave123

## Estrutura

```
src/
  App.jsx                 // estado global (ordens, view ativa, perfil, modal, drawer)
  App.css                 // estilos globais (tokens de cor extraídos da logo)
  assets/altave-logo.png  // logo oficial usada na tela de login
  data/seedOrders.js      // dados de exemplo das 7 ordens iniciais
  utils/deadline.js       // funções compartilhadas (prazos, data/hora, avatares)
  components/
    Login.jsx
    Navbar.jsx             // abas, sino de notificações, seletor de perfil
    KanbanBoard.jsx         // colunas, filtros, drag-and-drop (troca de status + reordenação)
    OrderCard.jsx
    NewOrderModal.jsx
    OrderDrawer.jsx         // painel de detalhe, histórico, edição de responsável
    Reports.jsx             // tabela + exportação real em PDF e Excel
    ManualApi.jsx
    Settings.jsx            // perfis de acesso e switches de notificação
    Icons.jsx               // ícones SVG compartilhados
```

## Permissões por perfil

O seletor de perfil no canto superior direito (ao lado do nome do usuário) simula o controle
de acesso descrito no backlog:

- **Usuário padrão** — só visualiza o quadro e cria novas ordens; não pode arrastar cards
  nem alterar status/responsável no painel de detalhe.
- **Executor / Gestor** — podem mudar status, reordenar e reatribuir responsável.
- **Administrador** — acesso total, incluindo a aba **Configurações**.

## Observações

- Os dados vivem apenas em memória (`useState`) — um F5 volta ao estado inicial. Para persistir
  entre sessões é necessário um backend real ou `localStorage`.
- "Exportar PDF" e "Exportar Excel" geram arquivos de verdade no navegador, via `jspdf` e `xlsx`
  (sem precisar de servidor).
- Os links de "Manual de instalação", "Manual de uso" e "Documentação da API" são placeholders
  (`href="#"`) — aponte para os locais reais quando existirem.
