import { type NextRequest, NextResponse } from 'next/server'
import { monitorEvolutionConnection } from '@/lib/evolution-monitor'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const result = await monitorEvolutionConnection()
    return NextResponse.json({ ok: result.connected, ...result })
  } catch (error) {
    console.error('[monitor] Falha no monitor da Evolution:', (error as Error).message)
    return NextResponse.json({ error: 'Falha ao executar o monitor' }, { status: 500 })
  }
}
