import { randomUUID } from 'crypto'
import { neon } from '@neondatabase/serverless'

const ALERT_TO = 'gabrielle.diasfreitas2013@gmail.com'

type MonitorStatus = {
  connected: boolean
  state: string
  detail: string
}

function database() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!connectionString) throw new Error('DATABASE_URL não configurada')
  return neon(connectionString)
}

async function readEvolutionStatus(): Promise<MonitorStatus> {
  const baseUrl = process.env.EVOLUTION_API_URL?.replace(/\/$/, '')
  const apiKey = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  if (!baseUrl || !apiKey || !instance) {
    throw new Error('EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE não configurada')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)
  try {
    const response = await fetch(
      `${baseUrl}/instance/connectionState/${encodeURIComponent(instance)}`,
      { headers: { apikey: apiKey }, signal: controller.signal, cache: 'no-store' },
    )
    const body = await response.json().catch(() => null) as
      | { state?: unknown; connectionState?: unknown; instance?: { state?: unknown } }
      | null

    if (!response.ok) {
      return {
        connected: false,
        state: `http_${response.status}`,
        detail: `Evolution API respondeu HTTP ${response.status}`,
      }
    }

    const rawState = body?.instance?.state ?? body?.state ?? body?.connectionState
    const state = typeof rawState === 'string' ? rawState.toLowerCase() : 'unknown'
    return {
      connected: state === 'open' || state === 'connected',
      state,
      detail: `Estado informado pela Evolution API: ${state}`,
    }
  } catch (error) {
    const message = (error as Error).name === 'AbortError'
      ? 'A Evolution API demorou mais de 15 segundos para responder'
      : `Não foi possível consultar a Evolution API: ${(error as Error).message}`
    return { connected: false, state: 'unreachable', detail: message }
  } finally {
    clearTimeout(timeout)
  }
}

async function sendAlert(detail: string, incidentId: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ALERT_EMAIL_FROM
  if (!apiKey || !from) throw new Error('RESEND_API_KEY ou ALERT_EMAIL_FROM não configurada')

  const checkedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `evolution-disconnected-${incidentId}`,
    },
    body: JSON.stringify({
      from,
      to: [ALERT_TO],
      subject: '⚠️ WhatsApp desconectado — Essence Vorfest',
      text: [
        'A conexão da instância do WhatsApp na Evolution API está indisponível.',
        '',
        detail,
        `Verificação: ${checkedAt} (horário de Brasília)`,
        '',
        'Abra o painel da Evolution/Render e reconecte a instância antes de novos pagamentos.',
      ].join('\n'),
    }),
  })

  if (!response.ok) {
    const responseDetail = await response.text().catch(() => '')
    throw new Error(`Resend respondeu HTTP ${response.status}: ${responseDetail.slice(0, 300)}`)
  }
}

export async function monitorEvolutionConnection() {
  const result = await readEvolutionStatus()
  const db = database()

  await db`CREATE TABLE IF NOT EXISTS service_monitor_state (
    service TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    detail TEXT NOT NULL,
    incident_id UUID,
    last_checked_at TIMESTAMPTZ NOT NULL,
    alert_sent_at TIMESTAMPTZ
  )`

  if (result.connected) {
    await db`INSERT INTO service_monitor_state
      (service, state, detail, incident_id, last_checked_at, alert_sent_at)
      VALUES ('evolution', 'connected', ${result.detail}, NULL, NOW(), NULL)
      ON CONFLICT (service) DO UPDATE SET
        state = 'connected', detail = EXCLUDED.detail, incident_id = NULL,
        last_checked_at = NOW(), alert_sent_at = NULL`
    return { ...result, alerted: false }
  }

  const newIncidentId = randomUUID()
  const rows = await db`INSERT INTO service_monitor_state
    (service, state, detail, incident_id, last_checked_at, alert_sent_at)
    VALUES ('evolution', 'disconnected', ${result.detail}, ${newIncidentId}, NOW(), NULL)
    ON CONFLICT (service) DO UPDATE SET
      state = 'disconnected', detail = EXCLUDED.detail,
      incident_id = CASE
        WHEN service_monitor_state.state = 'connected' THEN EXCLUDED.incident_id
        ELSE service_monitor_state.incident_id
      END,
      last_checked_at = NOW(),
      alert_sent_at = CASE
        WHEN service_monitor_state.state = 'connected' THEN NULL
        ELSE service_monitor_state.alert_sent_at
      END
    RETURNING incident_id, alert_sent_at`

  const incidentId = String(rows[0].incident_id)
  if (rows[0].alert_sent_at) return { ...result, alerted: false }

  await sendAlert(result.detail, incidentId)
  await db`UPDATE service_monitor_state SET alert_sent_at = NOW()
    WHERE service = 'evolution' AND incident_id = ${incidentId}`
  return { ...result, alerted: true }
}
