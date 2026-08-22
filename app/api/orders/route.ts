import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'
import { createOrder, listOrders } from '@/lib/orders-service'

export async function POST(request: NextRequest) {
  try {
    const order = await request.json()
    const result = await createOrder(order)
    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  try {
    const orders = await listOrders()
    return NextResponse.json({ orders })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 502 })
  }
}
