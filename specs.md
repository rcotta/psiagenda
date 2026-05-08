


## Páginas e Comportamento

### Página inicial (/)

- Controle de login (campos login, password)
- Ao realizar login invocar POST /api/login passando username, password no request body
     - Apresentar mensagem "Usuário/senha desconhecidos" em caso de retorno 401
     - Apresentar mensagem "Erro interno do servidor; tente novamente mais tarde" em caso de retorno 500
     - Redirecionar para Painel Principal caso retorno 200 

## Painel principal (/principal)

## Cadastro de Paciente (/cadastrar_paciente)

## Nova sessão (/nova_sessao)

## Novo pacote (/novo_pacote)

## Pagamentos (/gerenciar_pagamentos)

## Remarcar sessão (/remarcar_sessao)


## APIs:

POST /apis/login (username, password) -> 200 (success), 401 (unauthorized), 500 (unknown error)
