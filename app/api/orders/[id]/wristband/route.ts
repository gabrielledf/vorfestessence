import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import { getOrder, markWristbandDelivered } from '@/lib/orders-service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const existing = await getOrder(id)
    if (!existing) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    if (existing.status === 'PULSEIRA_ENTREGUE') {
      return NextResponse.json({ order: existing })
    }
    if (existing.status !== 'VOUCHER_ENVIADO') {
      return NextResponse.json({ error: 'A pulseira só pode ser entregue após o envio do voucher.' }, { status: 409 })
    }

    const order = await markWristbandDelivered(id)
    if (!order) return NextResponse.json({ error: 'O status do pedido foi alterado. Atualize a lista.' }, { status: 409 })
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
