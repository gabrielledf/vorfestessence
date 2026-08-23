'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { formatBRL } from '@/lib/format'
import { EVENT } from '@/lib/event'
import type { Order, OrderStatus } from '@/lib/orders-service'

const labels: Record<OrderStatus, string> = {
  COMPROVANTE_ENVIADO: 'Aguardando confirmação',
  PAGO: 'Pagamento confirmado',
  VOUCHER_ENVIADO: 'Voucher enviado',
  PULSEIRA_ENTREGUE: 'Pulseira entregue',
  CANCELADO: 'Cancelado',
}

const sellers = ['Essence', 'Agafarma', 'Rotary', 'BNI'] as const

function csvCell(value: string | number | undefined) {
  const text = value == null ? '' : String(value)
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString('pt-BR') : ''
}

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'TODOS' | OrderStatus>('TODOS')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState('')
  const [delivering, setDelivering] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [offlineSaleOpen, setOfflineSaleOpen] = useState(false)
  const [offlineSeller, setOfflineSeller] = useState<(typeof sellers)[number]>('Essence')
  const [offlineQuantity, setOfflineQuantity] = useState('1')
  const [savingOfflineSale, setSavingOfflineSale] = useState(false)
  const [reconnectOpen, setReconnectOpen] = useState(false)
  const [loadingQrCode, setLoadingQrCode] = useState(false)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [reconnectError, setReconnectError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' })
      if (response.status === 401) return router.replace('/essence')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os pedidos.')
      setOrders(data.orders || [])
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const confirmPayment = async (id: string) => {
    const order = orders.find((item) => item.id === id)
    const prompt = order?.status === 'PAGO'
      ? 'Tentar enviar novamente o voucher pelo WhatsApp?'
      : 'Confirmar o pagamento e enviar o voucher pelo WhatsApp?'
    if (!window.confirm(prompt)) return
    setConfirming(id)
    setError('')
    try {
      const response = await fetch(`/api/orders/${id}/confirm`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível confirmar o pagamento.')
      await loadOrders()
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setConfirming('')
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.replace('/')
  }

  const generateWhatsAppQrCode = async () => {
    setReconnectOpen(true)
    setLoadingQrCode(true)
    setReconnectError('')
    setQrImage(null)
    setQrCode(null)
    setPairingCode(null)
    try {
      const response = await fetch('/api/admin/whatsapp/reconnect', {
        method: 'POST',
        cache: 'no-store',
      })
      if (response.status === 401) return router.replace('/essence')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível gerar o QR Code.')
      setQrImage(data.qrImage || null)
      setQrCode(data.qrCode || null)
      setPairingCode(data.pairingCode || null)
    } catch (reason) {
      setReconnectError((reason as Error).message)
    } finally {
      setLoadingQrCode(false)
    }
  }

  const exportOrders = () => {
    const headers = [
      'Nº do ticket', 'Nome', 'CPF', 'WhatsApp', 'E-mail', 'Quantidade', 'Valor',
      'Status', 'Data do pedido', 'Pagamento confirmado em', 'Voucher enviado em', 'Pulseira entregue em',
    ]
    const rows = orders.map((order) => [
      order.voucherCode,
      order.name,
      order.cpf,
      order.phone,
      order.email,
      order.quantity,
      order.amount.toFixed(2).replace('.', ','),
      labels[order.status],
      formatDate(order.createdAt),
      formatDate(order.paidAt),
      formatDate(order.voucherSentAt),
      formatDate(order.wristbandDeliveredAt),
    ])
    const csv = ['sep=;', headers.map(csvCell).join(';'), ...rows.map((row) => row.map(csvCell).join(';'))].join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `pedidos-vorfest-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const deliverWristband = async (id: string) => {
    if (!window.confirm('Confirmar que a pulseira deste pedido foi entregue?')) return
    setDelivering(id)
    setError('')
    try {
      const response = await fetch(`/api/orders/${id}/wristband`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível registrar a entrega da pulseira.')
      await loadOrders()
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setDelivering('')
    }
  }

  const createOfflineSale = async (event: FormEvent) => {
    event.preventDefault()
    setSavingOfflineSale(true)
    setError('')
    try {
      const response = await fetch('/api/orders/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller: offlineSeller,
          quantity: Number(offlineQuantity),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível cadastrar a venda presencial.')
      setOfflineSaleOpen(false)
      setOfflineSeller('Essence')
      setOfflineQuantity('1')
      await loadOrders()
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setSavingOfflineSale(false)
    }
  }

  const visibleOrders = useMemo(() => orders.filter((order) => filter === 'TODOS' || order.status === filter), [filter, orders])
  const summary = useMemo(() => {
    const paidStatuses: OrderStatus[] = ['PAGO', 'VOUCHER_ENVIADO', 'PULSEIRA_ENTREGUE']
    const activeOrders = orders.filter((order) => order.status !== 'CANCELADO')
    const pendingOrders = orders.filter((order) => order.status === 'COMPROVANTE_ENVIADO')
    const paidOrders = orders.filter((order) => paidStatuses.includes(order.status))
    const voucherOrders = orders.filter((order) => order.status === 'VOUCHER_ENVIADO' || order.status === 'PULSEIRA_ENTREGUE')
    const wristbandOrders = orders.filter((order) => order.status === 'PULSEIRA_ENTREGUE')
    const tickets = (items: Order[]) => items.reduce((total, order) => total + order.quantity, 0)

    return {
      activeOrders: activeOrders.length,
      requestedTickets: tickets(activeOrders),
      soldTickets: tickets(paidOrders),
      confirmedRevenue: paidOrders.reduce((total, order) => total + order.amount, 0),
      pendingOrders: pendingOrders.length,
      pendingTickets: tickets(pendingOrders),
      vouchersSent: tickets(voucherOrders),
      wristbandsDelivered: tickets(wristbandOrders),
    }
  }, [orders])

  return (
    <main className="min-h-screen bg-card/40 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Área administrativa</p><h1 className="mt-1 font-display text-3xl font-bold uppercase text-foreground">Ingressos vendidos</h1></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={generateWhatsAppQrCode} className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary">Reconectar WhatsApp</button>
            <button onClick={() => setOfflineSaleOpen(true)} disabled={loading} className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">Cadastrar venda presencial</button>
            <button onClick={() => setSummaryOpen(true)} disabled={loading} className="rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">Ver extrato</button>
            <button onClick={exportOrders} disabled={loading || orders.length === 0} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Exportar planilha</button>
            <button onClick={logout} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground">Sair</button>
          </div>
        </header>

        <div className="mt-7 flex flex-wrap gap-2">
          {([['TODOS', 'Todos'], ['COMPROVANTE_ENVIADO', 'Aguardando'], ['PAGO', 'Pagos'], ['VOUCHER_ENVIADO', 'Voucher enviado'], ['PULSEIRA_ENTREGUE', 'Pulseira entregue']] as const).map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-medium ${filter === value ? 'bg-primary text-primary-foreground' : 'border border-border bg-background text-foreground'}`}>{label}</button>
          ))}
        </div>
        {error && <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground"><tr><th className="px-5 py-4 font-medium">Nº do ticket</th><th className="px-5 py-4 font-medium">Nome</th><th className="px-5 py-4 font-medium">WhatsApp</th><th className="px-5 py-4 font-medium">Qtde.</th><th className="px-5 py-4 font-medium">Valor</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Ação</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">Carregando pedidos...</td></tr> : visibleOrders.length === 0 ? <tr><td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">Nenhum pedido nesta lista.</td></tr> : visibleOrders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0"><td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-semibold text-foreground">{order.voucherCode}</td><td className="px-5 py-4 font-medium text-foreground"><span className="block">{order.name}</span><span className="text-xs text-muted-foreground">{order.email}</span></td><td className="px-5 py-4 text-foreground">{order.phone}</td><td className="px-5 py-4 text-foreground">{order.quantity}</td><td className="px-5 py-4 text-foreground">{formatBRL(order.amount)}</td><td className="px-5 py-4"><span className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground">{labels[order.status]}</span></td><td className="px-5 py-4">{order.status === 'COMPROVANTE_ENVIADO' || order.status === 'PAGO' ? <button onClick={() => confirmPayment(order.id)} disabled={confirming === order.id} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">{confirming === order.id ? 'Enviando...' : order.status === 'PAGO' ? 'Reenviar voucher' : 'Confirmar pagamento'}</button> : order.status === 'VOUCHER_ENVIADO' ? <button onClick={() => deliverWristband(order.id)} disabled={delivering === order.id} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">{delivering === order.id ? 'Registrando...' : 'Entregar pulseira'}</button> : <span className="text-xs text-muted-foreground">{labels[order.status]}</span>}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {summaryOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="summary-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={() => setSummaryOpen(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Resumo consolidado</p>
                <h2 id="summary-title" className="mt-1 font-display text-2xl font-bold uppercase text-foreground">Extrato de ingressos</h2>
              </div>
              <button onClick={() => setSummaryOpen(false)} aria-label="Fechar extrato" className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground">Fechar</button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard label="Ingressos vendidos" value={summary.soldTickets} />
              <SummaryCard label="Receita confirmada" value={formatBRL(summary.confirmedRevenue)} />
              <SummaryCard label="Pendentes de confirmação" value={summary.pendingTickets} detail={`${summary.pendingOrders} pedido${summary.pendingOrders === 1 ? '' : 's'}`} />
              <SummaryCard label="Vouchers enviados" value={summary.vouchersSent} />
              <SummaryCard label="Pulseiras entregues" value={summary.wristbandsDelivered} />
              <SummaryCard label="Total solicitado" value={summary.requestedTickets} detail={`${summary.activeOrders} pedido${summary.activeOrders === 1 ? '' : 's'} ativo${summary.activeOrders === 1 ? '' : 's'}`} />
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Ingressos vendidos incluem pagamentos confirmados, vouchers enviados e pulseiras entregues. Pedidos cancelados não entram nos totais.</p>
          </div>
        </div>
      )}

      {reconnectOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="reconnect-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={() => !loadingQrCode && setReconnectOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 text-center shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 text-left">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Evolution API</p>
                <h2 id="reconnect-title" className="mt-1 font-display text-2xl font-bold uppercase text-foreground">Reconectar WhatsApp</h2>
              </div>
              <button type="button" onClick={() => setReconnectOpen(false)} disabled={loadingQrCode} aria-label="Fechar reconexão" className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground disabled:opacity-50">Fechar</button>
            </div>

            {loadingQrCode && <p className="py-12 text-sm text-muted-foreground">Gerando um novo QR Code no Render...</p>}

            {!loadingQrCode && reconnectError && (
              <div className="mt-6">
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{reconnectError}</p>
                <button type="button" onClick={generateWhatsAppQrCode} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Tentar novamente</button>
              </div>
            )}

            {!loadingQrCode && !reconnectError && (qrImage || qrCode || pairingCode) && (
              <div className="mt-6">
                {(qrImage || qrCode) && <div className="mx-auto w-fit rounded-2xl bg-white p-4">
                  {qrImage
                    ? <img src={qrImage} alt="QR Code para reconectar o WhatsApp" className="h-64 w-64" />
                    : <QRCode value={qrCode!} size={256} aria-label="QR Code para reconectar o WhatsApp" />}
                </div>}
                {pairingCode && <p className="mt-4 text-sm text-muted-foreground">Código de pareamento: <strong className="font-mono text-foreground">{pairingCode}</strong></p>}
                <p className="mt-5 text-sm text-foreground">No celular do Essence, abra <strong>WhatsApp → Aparelhos conectados → Conectar aparelho</strong>{qrImage || qrCode ? ' e escaneie o código.' : ' e use a opção de conexão com número de telefone.'}</p>
                <p className="mt-2 text-xs text-muted-foreground">O QR Code expira rapidamente. Se isso acontecer, gere um novo.</p>
                <button type="button" onClick={generateWhatsAppQrCode} className="mt-5 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-primary">Gerar outro QR Code</button>
              </div>
            )}
          </div>
        </div>
      )}

      {offlineSaleOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="offline-sale-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8" onClick={() => !savingOfflineSale && setOfflineSaleOpen(false)}>
          <form onSubmit={createOfflineSale} className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Venda fora do site</p>
                <h2 id="offline-sale-title" className="mt-1 font-display text-2xl font-bold uppercase text-foreground">Venda presencial</h2>
              </div>
              <button type="button" onClick={() => setOfflineSaleOpen(false)} disabled={savingOfflineSale} aria-label="Fechar cadastro" className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground disabled:opacity-50">Fechar</button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">Vendedor
                <select value={offlineSeller} onChange={(event) => setOfflineSeller(event.target.value as (typeof sellers)[number])} className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60">
                  {sellers.map((seller) => <option key={seller} value={seller}>{seller}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-foreground">Quantidade de ingressos
                <input type="number" min="1" step="1" value={offlineQuantity} onChange={(event) => setOfflineQuantity(event.target.value)} required className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60" />
              </label>
              <label className="block text-sm font-medium text-foreground">Valor total da venda
                <input type="text" value={formatBRL(Number(offlineQuantity || 0) * EVENT.ticketPrice)} readOnly className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 font-semibold text-foreground" />
              </label>
            </div>

            <button disabled={savingOfflineSale} className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">{savingOfflineSale ? 'Cadastrando...' : 'Cadastrar venda'}</button>
            <p className="mt-3 text-center text-xs text-muted-foreground">A venda será cadastrada como pulseira entregue, sem envio de voucher.</p>
          </form>
        </div>
      )}
    </main>
  )
}

function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </div>
  )
}
