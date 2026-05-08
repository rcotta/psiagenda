

Setup:
1. HOJE = data atual
2. SEMANA_ATUAL =  HOJE se hoje for segunda-feira, ou a segunda-feira anterior à HOJE
3. USUARIO = login=renata, password=Psi@2026
4. PACIENTE_1 = nome="Machado de Assis", telefone="(21) 92293-4942", email="cubasdobras@example.com"
5. PACIENTE_2 = nome="Clarice Lispector", telefone="(81) 98545-4942", email="estreladahora@example.com"
6. PACIENTE_3 = nome="Lima Barreto", telefone="(21) 88334-1393", email="polis.e.carpos@example.com"
7. PACIENTE_4 = nome="Graciliano Ramos", telefone="(82) 88293-0012", email="viventes@example.com"
8. URL_INICIAL = http://localhost:8000/


Passos dos testes:
- Acessar URL_INICIAL, fazer login com dados em USUARIO
- Acessar Cadastro de Paciente
- Preencher dados de PACIENTE_1, Salvar; clicar em "Cadastrar Outro"
- Preencher dados de PACIENTE_2, Salvar; clicar em "Cadastrar Outro"
- Preencher dados de PACIENTE_3, Salvar; clicar em "Cadastrar Outro"
- Preencher dados de PACIENTE_4, Salvar; clicar em "Voltar ao Painel"
- Clicar em "Nova Sessão"
- Selecionar PACIENTE_1, data SEMANA_ATUAL+2, hora=13:00, valor=150,00; clicar "Salvar"; clicar "Voltar ao Painel"
- Clicar "Novo Pacote"
- Selecionar PACIENTE_2, repetir a cada="1" e "semana", Dias="Qua", Hora=15:00, quantidade de sessões = 10, valor total=R$950,00; Clicar em Salvar
- Clicar em Voltar ao Painel
- Clicar em "Pagamentos"
- Selecionar PACIENTE_2, preencher primeira linha com data HOJE, alterar status para Pago, preencher Observação com "Pago com PIX no banco Bradesco", clicar em "Salvar Alterações"; clicar em "Voltar ao Painel"
- Clicar em "Agenda"; clicar em ">" (ir para a próxima semana), na primeira sessão clicar "Remarcar"; preencher data com HOJE+1, hora com 09:00; salvar; clicar em "Voltar ao Painel"
- Clicar em "Agenda"; na primeira sessão clicar "Marcar como realizada"; clicar em "<-" para voltar para o painel principal

