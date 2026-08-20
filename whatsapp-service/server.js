/**
 * Microserviço de WhatsApp — Vorfest Essence
 * -------------------------------------------------
 * Servidor Express ultra-leve com Baileys (open source, sem custo por mensagem).
 * Deploy como Web Service (Free Tier) no Render.com usando o Dockerfile incluso.
 *
 * Endpoints:
 *   GET  /health         -> health check (mantém o serviço "acordado")
 *   GET  /status         -> status da conexão do WhatsApp + QR (se aguardando login)
 *   POST /send-voucher   -> recebe a chamada da Vercel e envia o voucher ao cliente
 *
 * Autenticação:
 *   As chamadas para /send-voucher exigem o header:
 *     Authorization: Bearer <WHATSAPP_SERVICE_TOKEN>
 *
 * Variáveis de ambiente (configure no painel do Render):
 *   PORT                     porta HTTP (o Render injeta automaticamente)
 *   WHATSAPP_SERVICE_TOKEN   token compartilhado com a rota /api/webhook/pix da Vercel
 *   EVENT_NAME               (opcional) nome do evento exibido no voucher
 *   EVENT_VENUE              (opcional) local do evento
 *   EVENT_DATE               (opcional) data do evento
 */

import { Boom } from '@hapi/boom'
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import express from 'express'
import pino from 'pino'
import qrcodeTerminal from 'qrcode-terminal'

const PORT = process.env.PORT || 3001
const SERVICE_TOKEN = process.env.WHATSAPP_SERVICE_TOKEN || ''
const AUTH_DIR = process.env.AUTH_DIR || './auth_state'

const EVENT = {
  name: process.env.EVENT_NAME || 'Essence Vorfest',
  venue: process.env.EVENT_VENUE || 'Essence Restaurante e Eventos',
  date: process.env.EVENT_DATE || 'Sábado, 26 de Setembro de 2026',
}

const logger = pino({ level: 'warn' })

// ------- Estado global da conexão -------
let sock = null
let connectionState = 'disconnected' // disconnected | connecting | qr | open
let lastQR = null

// ------- Formata número para o padrão internacional do WhatsApp -------
function toWhatsAppJid(phone) {
  let digits = String(phone).replace(/\D/g, '')
  // Adiciona DDI do Brasil se vier sem
  if (digits.length <= 11) digits = `55${digits}`
  return `${digits}@s.whatsapp.net`
}

// ------- Monta a mensagem do voucher -------
function buildVoucherMessage({ name, quantity, amount, txid }) {
  const firstName = String(name || 'Cliente').split(' ')[0]
  const plural = Number(quantity) > 1 ? 's' : ''
  const total = Number(amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    `*PAGAMENTO CONFIRMADO!* \u{1F37B}\n\n` +
    `Olá, ${firstName}! Seu pagamento foi aprovado e seu ingresso está garantido.\n\n` +
    `*${EVENT.name}*\n` +
    `_O Aquece da Oktoberfest_\n\n` +
    `----------------------------------\n` +
    `*VOUCHER DE INGRESSO*\n` +
    `Nome: ${name}\n` +
    `Ingresso${plural}: ${quantity}\n` +
    `Total pago: ${total}\n` +
    `Código: ${txid}\n` +
    `----------------------------------\n\n` +
    `*Local:* ${EVENT.venue}\n` +
    `*Data:* ${EVENT.date}\n\n` +
    `*Como retirar sua pulseira:*\n` +
    `Apresente este voucher na entrada do evento junto com um documento com foto para trocar pela sua pulseira de acesso.\n\n` +
    `Nos vemos lá! Prost! \u{1F37B}`
  )
}

// ------- Inicializa/mantém a conexão do WhatsApp -------
async function startSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  connectionState = 'connecting'

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['Essence Vorfest', 'Chrome', '1.0.0'],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      lastQR = qr
      connectionState = 'qr'
      // Exibe o QR no log do Render para você escanear e autenticar
      qrcodeTerminal.generate(qr, { small: true })
      console.log('[wa] Escaneie o QR Code acima com o WhatsApp para conectar.')
    }

    if (connection === 'open') {
      connectionState = 'open'
      lastQR = null
      console.log('[wa] WhatsApp conectado com sucesso.')
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      connectionState = 'disconnected'
      console.log('[wa] Conexão encerrada. Reconectar?', shouldReconnect)
      if (shouldReconnect) startSocket()
    }
  })

  return sock
}

// ------- Servidor HTTP -------
const app = express()
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'vorfest-whatsapp', connection: connectionState })
})

app.get('/status', (_req, res) => {
  res.json({
    connection: connectionState,
    qr: connectionState === 'qr' ? lastQR : null,
    hint:
      connectionState === 'qr'
        ? 'Abra os logs do Render e escaneie o QR Code para conectar o WhatsApp.'
        : undefined,
  })
})

app.post('/send-voucher', async (req, res) => {
  // Autenticação da chamada vinda da Vercel
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')
  if (!SERVICE_TOKEN || token !== SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const { name, phone, quantity = 1, amount = 0, txid = '' } = req.body || {}
  if (!phone) {
    return res.status(400).json({ error: 'Telefone (phone) é obrigatório' })
  }

  if (connectionState !== 'open' || !sock) {
    return res.status(503).json({ error: 'WhatsApp não está conectado. Verifique /status.' })
  }

  try {
    const jid = toWhatsAppJid(phone)
    const message = buildVoucherMessage({ name, quantity, amount, txid })
    await sock.sendMessage(jid, { text: message })
    console.log(`[wa] Voucher enviado para ${jid} (txid: ${txid})`)
    return res.json({ sent: true, to: jid })
  } catch (err) {
    console.error('[wa] Erro ao enviar voucher:', err?.message)
    return res.status(500).json({ error: 'Falha ao enviar a mensagem' })
  }
})

app.listen(PORT, () => {
  console.log(`[wa] Serviço ouvindo na porta ${PORT}`)
  startSocket().catch((e) => console.error('[wa] Erro ao iniciar socket:', e?.message))
})
