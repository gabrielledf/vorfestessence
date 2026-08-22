# Vorfest Essence — Microserviço de WhatsApp

Serviço Node.js/Express + [Baileys](https://github.com/WhiskeySockets/Baileys) (open source, sem custo por mensagem) que envia o voucher de ingresso via WhatsApp. Desenhado para rodar no **Free Tier do Render.com** via Docker.

## Arquitetura

```
Cliente paga PIX
      │
      ▼
Gateway (Mercado Pago / Asaas / EFI)  ──►  Vercel: /api/webhook/pix
                                                     │  (status == approved)
                                                     ▼
                                      Render: POST /send-voucher  ──►  WhatsApp do cliente
```

## Endpoints

| Método | Rota             | Descrição                                                        |
| ------ | ---------------- | ---------------------------------------------------------------- |
| GET    | `/health`        | Health check (use no `healthCheckPath` do Render).               |
| GET    | `/status`        | Estado da conexão. Mostra o QR (string) quando aguardando login. |
| POST   | `/send-voucher`  | Envia o voucher. Requer `Authorization: Bearer <TOKEN>`.         |

### Corpo do `POST /send-voucher`

```json
{
  "name": "Maria Silva",
  "phone": "(41) 99999-9999",
  "quantity": 2,
  "amount": 340,
  "txid": "VORFEST123ABC"
}
```

## Variáveis de ambiente

| Variável                 | Obrigatória | Descrição                                                     |
| ------------------------ | ----------- | ------------------------------------------------------------- |
| `WHATSAPP_SERVICE_TOKEN` | Sim         | Token compartilhado com a Vercel para autenticar as chamadas. |
| `PORT`                   | Não         | Injetada automaticamente pelo Render.                         |
| `EVENT_NAME`             | Não         | Nome do evento no voucher.                                    |
| `EVENT_VENUE`            | Não         | Local do evento no voucher.                                   |
| `EVENT_DATE`             | Não         | Data do evento no voucher.                                    |
| `AUTH_DIR`               | Não         | Pasta das credenciais do WhatsApp (padrão `./auth_state`).    |

## Deploy no Render.com

1. Faça push deste repositório no GitHub.
2. No Render, **New > Web Service** e aponte para a pasta `whatsapp-service` (ou use o `render.yaml` como Blueprint).
3. Runtime: **Docker**. Plano: **Free**.
4. Em **Environment**, defina `WHATSAPP_SERVICE_TOKEN` com um valor secreto forte.
5. Após o deploy, abra os **Logs** do serviço: um QR Code aparecerá no terminal.
6. No celular, abra **WhatsApp > Aparelhos conectados > Conectar aparelho** e escaneie o QR.
7. Quando os logs mostrarem `WhatsApp conectado com sucesso`, o serviço está pronto.

> **Importante sobre o Free Tier:** o serviço "dorme" após inatividade e o disco de credenciais não persiste no plano free — nesses casos você precisará reescanear o QR após reinícios. Para produção estável, use um disco persistente (plano Starter) montado em `/app/auth_state`.

## Ligando com a Vercel

No projeto Next.js (Vercel), defina:

- `WHATSAPP_SERVICE_URL` = URL pública do serviço no Render (ex.: `https://vorfest-whatsapp.onrender.com`)
- `WHATSAPP_SERVICE_TOKEN` = **o mesmo** token configurado aqui

Para o backoffice, defina também no projeto Next.js:

- `ESSENCE_ADMIN_PASSWORD` = senha exclusiva do painel (não use a senha do Gmail)
- `ESSENCE_ADMIN_SESSION_SECRET` = segredo longo e aleatório para assinar a sessão

Os pedidos são gravados no Neon Postgres pelo projeto Next.js. O Render é usado somente para manter o WhatsApp conectado e enviar vouchers.

## Rodando localmente

```bash
cd whatsapp-service
npm install
WHATSAPP_SERVICE_TOKEN=meu-token npm start
# escaneie o QR exibido no terminal
```
