import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, createAdminSession, isValidAdminLogin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  const { email = '', password = '' } = await request.json().catch(() => ({}))
  if (!isValidAdminLogin(String(email), String(password))) {
    return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
  return response
}
