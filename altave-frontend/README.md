# Altave — Central de Ordens de Serviço (frontend)

A interface React usa o Vite e consome a API Express. O [manual de instalação e implantação](../docs/instalacao.md) explica como configurar a API, rodar a aplicação localmente e publicar o build em homologação.

A variável `VITE_API_URL`, exemplificada em `.env.example`, define a URL da API usada por `src/services/api.js`. O Vite incorpora esse valor durante o build.
