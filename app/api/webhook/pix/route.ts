import { type NextRequest, NextResponse } from 'next/server'

/**
 * Webhook de confirmação de PIX (Vercel Serverless).
 *
 * Recebe o aviso do gateway de pagamento (Mercado Pago / Asaas / EFI Pay)
 * de que o PIX foi confirmado. Quando o pagamento está aprovado, faz um POST
 * para o microserviço de WhatsApp hospedado no Render.com, que dispara o voucher.
 *
 * Variáveis de ambiente esperadas:
 * - WHATSAPP_SERVICE_URL   URL base do serviço no Render (ex.: https://vorfest-wa.onrender.com)
 * - WHATSAPP_SERVICE_TOKEN Token compartilhado para autenticar a chamada Vercel -> Render
 * - PIX_WEBHOOK_SECRET     (opcional) segredo para validar a origem do gateway
 */

interface NormalizedPayment {
  status: 'approved' | 'pending' | 'rejected' | 'unknown'
  txid: string
  amount: number
  customerName: string
  customerPhone: string
  quantity: number
}

/**
 * Normaliza os formatos dos principais gateways brasileiros em um objeto único.
 * Ajuste o parsing conforme o gateway que você contratar.
 */
function normalizePayload(body: any): NormalizedPayment {
  // Mercado Pago (notificação de "payment")
  if (body?.action?.startsWith('payment') || body?.type === 'payment') {
    return {
      status: body?.data?.status === 'approved' ? 'approved' : 'pending',
      txid: String(body?.data?.id ?? ''),
      amount: Number(body?.data?.transaction_amount ?? 0),
      customerName: body?.metadata?.customer_name ?? '',
      customerPhone: body?.metadata?.customer_phone ?? '',
      quantity: Number(body?.metadata?.quantity ?? 1),
    }
  }

  // Asaas (evento PAYMENT_RECEIVED / PAYMENT_CONFIRMED)
  if (body?.event?.startsWith('PAYMENT')) {
    const confirmed = body.event === 'PAYMENT_RECEIVED' || body.event === 'PAYMENT_CONFIRMED'
    return {
      status: confirmed ? 'approved' : 'pending',
      txid: String(body?.payment?.id ?? ''),
      amount: Number(body?.payment?.value ?? 0),
      customerName: body?.payment?.customerName ?? '',
      customerPhone: body?.payment?.customerPhone ?? '',
      quantity: Number(body?.payment?.quantity ?? 1),
    }
  }

  // EFI Pay / genérico
  return {
    status: body?.status === 'approved' || body?.status === 'CONCLUIDA' ? 'approved' : 'unknown',
    txid: String(body?.txid ?? body?.id ?? ''),
    amount: Number(body?.amount ?? body?.valor ?? 0),
    customerName: body?.customerName ?? body?.nome ?? '',
    customerPhone: body?.customerPhone ?? body?.telefone ?? '',
    quantity: Number(body?.quantity ?? 1),
  }
}

export async function POST(req: NextRequest) {
  try {
    // Validação opcional da origem via segredo
    const secret = process.env.PIX_WEBHOOK_SECRET
    if (secret) {
      const provided = req.headers.get('x-webhook-secret') ?? req.nextUrl.searchParams.get('secret')
      if (provided !== secret) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
      }
    }

    const body = await req.json().catch(() => ({}))
    const payment = normalizePayload(body)

    console.log('[v0] Webhook PIX recebido:', {
      status: payment.status,
      txid: payment.txid,
      amount: payment.amount,
    })

    // Só dispara o voucher quando o pagamento está aprovado
    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true, status: payment.status })
    }

    const serviceUrl = process.env.WHATSAPP_SERVICE_URL
    if (!serviceUrl) {
      console.log('[v0] WHATSAPP_SERVICE_URL não configurada — voucher não enviado.')
      return NextResponse.json(
        { received: true, warning: 'WHATSAPP_SERVICE_URL não configurada' },
        { status: 200 },
      )
    }

    // Encaminha para o microserviço do Render
    const res = await fetch(`${serviceUrl.replace(/\/$/, '')}/send-voucher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WHATSAPP_SERVICE_TOKEN ?? ''}`,
      },
      body: JSON.stringify({
        name: payment.customerName,
        phone: payment.customerPhone,
        quantity: payment.quantity,
        amount: payment.amount,
        txid: payment.txid,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.log('[v0] Falha ao acionar o serviço de WhatsApp:', res.status, text)
      return NextResponse.json({ received: true, forwarded: false }, { status: 502 })
    }

    return NextResponse.json({ received: true, forwarded: true })
  } catch (err) {
    console.log('[v0] Erro no webhook PIX:', (err as Error).message)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// Alguns gateways validam o endpoint com um GET de "health check"
export async function GET() {
  return NextResponse.json({ ok: true, service: 'vorfest-pix-webhook' })
}
