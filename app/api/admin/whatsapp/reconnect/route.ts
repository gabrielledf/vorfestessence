import { type NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'

type ConnectResponse = {
  base64?: unknown
  code?: unknown
  pairingCode?: unknown
  count?: unknown
  qrcode?: { base64?: unknown; code?: unknown }
}

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authenticated = isValidAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  )
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  if (!baseUrl || !apiKey || !instance) {
    return NextResponse.json(
      { error: 'Evolution API não configurada no servidor.' },
      { status: 500 },
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  try {
    const response = await fetch(
      `${baseUrl}/instance/connect/${encodeURIComponent(instance)}`,
      {
        method: 'GET',
        headers: { apikey: apiKey },
        signal: controller.signal,
        cache: 'no-store',
      },
    )
    const body = await response.json().catch(() => null) as ConnectResponse | null

    if (!response.ok) {
      return NextResponse.json(
        { error: `A Evolution API respondeu HTTP ${response.status}.` },
        { status: 502 },
      )
    }

    const rawImage = body?.base64 ?? body?.qrcode?.base64
    const rawCode = body?.code ?? body?.qrcode?.code
    const qrImage = typeof rawImage === 'string' && rawImage
      ? rawImage.startsWith('data:image/') ? rawImage : `data:image/png;base64,${rawImage}`
      : null
    const qrCode = typeof rawCode === 'string' && rawCode ? rawCode : null
    const pairingCode = typeof body?.pairingCode === 'string' && body.pairingCode
      ? body.pairingCode
      : null

    if (!qrImage && !qrCode && !pairingCode) {
      return NextResponse.json(
        {
          error: 'A Evolution não retornou um QR Code. A instância pode já estar conectada; aguarde alguns segundos e tente novamente.',
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ qrImage, qrCode, pairingCode })
  } catch (error) {
    const message = (error as Error).name === 'AbortError'
      ? 'A Evolution API demorou mais de 20 segundos para responder.'
      : 'Não foi possível acessar a Evolution API no Render.'
    return NextResponse.json({ error: message }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
