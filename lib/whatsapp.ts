/** Cliente server-side para a Evolution API. Não o importe em componentes client. */

import { isValidPhone } from '@/lib/format'

interface VoucherData {
  name: string
  phone: string
  quantity: number
  amount: number
  txid: string
}

function toBrazilianWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (isValidPhone(digits)) return `55${digits}`
  if (digits.startsWith('55') && isValidPhone(digits.slice(2))) return digits
  throw new Error('WhatsApp inválido: informe um celular brasileiro completo com DDD')
}

function voucherText({ name, quantity, amount, txid }: VoucherData): string {
  const firstName = name.trim().split(/\s+/)[0] || 'Cliente'
  const plural = quantity > 1 ? 's' : ''
  const total = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return [
    '*PAGAMENTO CONFIRMADO!* 🍺', '',
    `Olá, ${firstName}! Seu pagamento foi aprovado e seu ingresso está garantido.`, '',
    '*Essence Vorfest*', '_O Aquece da Oktoberfest_', '',
    '----------------------------------', '*VOUCHER DE INGRESSO*', `Nome: ${name}`,
    `Ingresso${plural}: ${quantity}`, `Total pago: ${total}`, `Código: ${txid}`,
    '----------------------------------', '', '*Local:* Essence Restaurante e Eventos',
    '*Data:* Sábado, 26 de Setembro de 2026, 20H', '',
    'Apresente este voucher e um documento com foto para retirar sua pulseira de acesso.', '',
    'A pulseira pode ser retirada no Essence de segunda à sábado, das 9H-13H, ou no dia do evento a partir das 19H:30M', '',
    'Nos vemos lá! Prost! 🍺',
  ].join('\n')
}

export async function sendVoucherByWhatsApp(data: VoucherData) {
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  if (!baseUrl || !apiKey || !instance) {
    throw new Error('Evolution API não configurada: defina EVOLUTION_API_URL, EVOLUTION_API_KEY e EVOLUTION_INSTANCE')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  let response: Response

  try {
    response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        number: toBrazilianWhatsAppNumber(data.phone),
        text: voucherText(data),
        linkPreview: false,
      }),
      signal: controller.signal,
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('A Evolution API demorou mais de 20 segundos para responder')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Evolution API respondeu ${response.status}: ${detail.slice(0, 500)}`)
  }
}
