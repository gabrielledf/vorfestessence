import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import { createOfflineOrder } from '@/lib/orders-service'
import { EVENT } from '@/lib/event'

const SELLERS = ['Essence', 'Agafarma', 'Rotary', 'BNI'] as const

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const seller = String(body.seller ?? '')
    const quantity = Number(body.quantity)

    if (!SELLERS.includes(seller as (typeof SELLERS)[number])) {
      return NextResponse.json({ error: 'Selecione um vendedor válido.' }, { status: 400 })
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Informe uma quantidade válida de ingressos.' }, { status: 400 })
    }

    const order = await createOfflineOrder({ seller, quantity, amount: quantity * EVENT.ticketPrice })
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
