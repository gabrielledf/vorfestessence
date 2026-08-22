import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const authenticated = isValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)
  return NextResponse.json({ authenticated })
}
