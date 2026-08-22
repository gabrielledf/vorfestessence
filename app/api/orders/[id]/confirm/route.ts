import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import { getOrder, markPaid, markVoucherSent, sendVoucher } from '@/lib/orders-service'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    const { id } = await params
    const existing = await getOrder(id)
    if (!existing) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    if (existing.status === 'VOUCHER_ENVIADO') {
      return NextResponse.json({ error: 'Voucher já foi enviado para este pedido.' }, { status: 409 })
    }

    const paidOrder = existing.status === 'PAGO' ? existing : await markPaid(id)
    if (!paidOrder) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    await sendVoucher(paidOrder)
    const order = await markVoucherSent(id)
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
