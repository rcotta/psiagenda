# PsiAgenda Frontend (Protótipo Navegável)

Este diretório contém um protótipo navegável para uma aplicação de psicólogos com foco em:

- controle de pacientes
- agenda de sessões
- pacotes e pagamentos

## Tecnologias utilizadas

- **HTML5** para estrutura semântica das telas.
- **CSS3** com classes reutilizáveis para manter estilo clean e consistente.
- **jQuery 3.7.1 (CDN)** para interações simples de navegação e feedback de ações.
- **Font Awesome (CDN)** para ícones de apoio visual (calendário, relógio, etc.).
- **Google Fonts (Inter)** para tipografia limpa e legível.

## Organização dos arquivos

- `index.html`: contém todas as telas do protótipo.
- `styles.css`: estilos globais e componentes visuais compartilhados.
- `app.js`: lógica de navegação entre telas e ações simuladas.

## Telas implementadas

- Login (aceita qualquer login/senha para simulação)
- Home (hub pós-login)
- Paciente
- Nova Sessão
- Novo Pacote
- Pagamentos
- Remarcar Sessão

## Como executar localmente

1. Abra o arquivo `index.html` no navegador.
2. Faça login com qualquer valor nos campos.
3. Navegue pelas telas usando os atalhos da Home e botões de voltar/cancelar.

## Observação para integração futura

O protótipo foi construído para ser uma primeira versão visual/funcional do frontend.  
A futura integração com backend em Python pode reutilizar esta estrutura de telas e substituir as ações mock por chamadas reais de API.
