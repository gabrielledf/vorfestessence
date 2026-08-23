# Monitoramento da Evolution API

O endpoint protegido `/api/cron/evolution-health` consulta o estado da instância
na Evolution API. Estados `open` e `connected` são saudáveis; qualquer outro
estado, erro HTTP ou timeout é tratado como indisponibilidade.

Quando uma queda é detectada, o sistema envia um e-mail para
`gabrielle.diasfreitas2013@gmail.com`. O incidente fica registrado no Neon para
que a mesma queda gere apenas um alerta. Depois que a conexão volta ao normal,
uma nova queda pode gerar um novo alerta.

## Variáveis na Vercel

- `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE`
- `DATABASE_URL` (normalmente fornecida pela integração Neon)
- `CRON_SECRET`: valor aleatório com ao menos 16 caracteres
- `RESEND_API_KEY`: chave da conta Resend
- `ALERT_EMAIL_FROM`: remetente validado no Resend, por exemplo
  `Essence Vorfest <alertas@seudominio.com>`

Depois de configurar as variáveis, faça um novo deploy de produção.

## Frequência

A Vercel executa uma verificação todos os dias às 10:00 UTC (7h no horário
de Brasília), conforme `vercel.json`. No plano Hobby, a Vercel pode iniciar a
execução em qualquer momento dentro dessa hora.

O alerta é enviado imediatamente após essa verificação detectar a falha. Como
não há verificações durante o restante do dia, uma desconexão ocorrida depois
da execução poderá ser detectada somente na manhã seguinte.

Para fazer um teste manual, envie uma requisição GET para
`/api/cron/evolution-health` com o cabeçalho
`Authorization: Bearer <CRON_SECRET>`.
