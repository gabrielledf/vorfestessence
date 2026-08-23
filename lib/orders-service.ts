import { randomUUID } from 'crypto'
import { neon } from '@neondatabase/serverless'
import { sendVoucherByWhatsApp } from '@/lib/whatsapp'

export type OrderStatus = 'COMPROVANTE_ENVIADO' | 'PAGO' | 'VOUCHER_ENVIADO' | 'CANCELADO'

export interface Order {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
  quantity: number
  amount: number
  txid: string
  voucherCode: string
  status: OrderStatus
  createdAt: string
  paidAt?: string
  voucherSentAt?: string
}

type OrderRow = {
  id: string; name: string; cpf: string; phone: string; email: string; quantity: number; amount: string | number
  txid: string; voucher_code: string; status: OrderStatus; created_at: string; paid_at: string | null; voucher_sent_at: string | null
}

function sql() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada. Instale e conecte o Neon ao projeto Vercel.')
  return neon(connectionString)
}

let schemaPromise: Promise<void> | undefined

async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = sql()
      await db`CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        cpf TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
        txid TEXT NOT NULL UNIQUE,
        voucher_code TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL CHECK (status IN ('COMPROVANTE_ENVIADO', 'PAGO', 'VOUCHER_ENVIADO', 'CANCELADO')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        voucher_sent_at TIMESTAMPTZ
      )`
    })()
  }
  return schemaPromise
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id, name: row.name, cpf: row.cpf, phone: row.phone, email: row.email,
    quantity: Number(row.quantity), amount: Number(row.amount), txid: row.txid,
    voucherCode: row.voucher_code, status: row.status, createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined, voucherSentAt: row.voucher_sent_at ?? undefined,
  }
}

function voucherCode() {
  return `VF-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

export async function createOrder(input: Omit<Order, 'id' | 'voucherCode' | 'status' | 'createdAt' | 'paidAt' | 'voucherSentAt'>) {
  await ensureSchema()
  const db = sql()
  const existing = (await db`SELECT * FROM orders WHERE txid = ${input.txid}`) as OrderRow[]
  if (existing[0]) return toOrder(existing[0])
  const rows = (await db`INSERT INTO orders (id, name, cpf, phone, email, quantity, amount, txid, voucher_code, status)
    VALUES (${randomUUID()}, ${input.name}, ${input.cpf}, ${input.phone}, ${input.email}, ${input.quantity}, ${input.amount}, ${input.txid}, ${voucherCode()}, 'COMPROVANTE_ENVIADO')
    RETURNING *`) as OrderRow[]
  return toOrder(rows[0])
}

export async function listOrders() {
  await ensureSchema()
  const db = sql()
  const rows = (await db`SELECT * FROM orders ORDER BY name ASC, created_at ASC`) as OrderRow[]
  return rows.map(toOrder)
}

export async function getOrder(id: string) {
  await ensureSchema()
  const db = sql()
  const rows = (await db`SELECT * FROM orders WHERE id = ${id}`) as OrderRow[]
  return rows[0] ? toOrder(rows[0]) : undefined
}

export async function markPaid(id: string) {
  await ensureSchema()
  const db = sql()
  const rows = (await db`UPDATE orders SET status = 'PAGO', paid_at = COALESCE(paid_at, NOW()) WHERE id = ${id} RETURNING *`) as OrderRow[]
  return rows[0] ? toOrder(rows[0]) : undefined
}

export async function markVoucherSent(id: string) {
  await ensureSchema()
  const db = sql()
  const rows = (await db`UPDATE orders SET status = 'VOUCHER_ENVIADO', voucher_sent_at = NOW() WHERE id = ${id} RETURNING *`) as OrderRow[]
  return rows[0] ? toOrder(rows[0]) : undefined
}

export async function sendVoucher(order: Order) {
  await sendVoucherByWhatsApp({
    name: order.name,
    phone: order.phone,
    quantity: order.quantity,
    amount: order.amount,
    txid: order.voucherCode,
  })
}
