import { createHmac, timingSafeEqual } from 'crypto'

const ADMIN_EMAIL = 'essencerestaurante@gmail.com'
const SESSION_TTL_SECONDS = 60 * 60 * 12

function secret() {
  const value = process.env.ESSENCE_ADMIN_SESSION_SECRET
  if (!value) throw new Error('ESSENCE_ADMIN_SESSION_SECRET não configurado')
  return value
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

export function isValidAdminLogin(email: string, password: string) {
  const configuredPassword = process.env.ESSENCE_ADMIN_PASSWORD
  if (!configuredPassword || email.trim().toLowerCase() !== ADMIN_EMAIL) return false
  const provided = Buffer.from(password)
  const expected = Buffer.from(configuredPassword)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const value = `${ADMIN_EMAIL}.${expiresAt}`
  return `${value}.${sign(value)}`
}

export function isValidAdminSession(token?: string) {
  if (!token) return false
  const [email, expiration, signature] = token.split('.')
  if (email !== ADMIN_EMAIL || !expiration || !signature) return false
  if (Number(expiration) < Math.floor(Date.now() / 1000)) return false
  const value = `${email}.${expiration}`
  const expected = sign(value)
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

export const ADMIN_SESSION_COOKIE = 'essence_admin_session'
