'use client'

import { Check, Copy, MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { formatBRL } from '@/lib/format'

interface PixModalProps {
  open: boolean
  onClose: () => void
  payload: string
  amount: number
  customerName: string
  customer: { name: string; cpf: string; phone: string; email: string; quantity: number }
  essenceWhatsApp: string
}

export function PixModal({ open, onClose, payload, amount, customerName, customer, essenceWhatsApp }: PixModalProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) setCopied(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // O código segue visível para cópia manual se o navegador bloquear a área de transferência.
    }
  }

  const whatsappMessage = [
    'Olá, Essence! Gostaria de confirmar minha compra para o Essence Vorfest.',
    '',
    `Nome: ${customer.name}`,
    `CPF: ${customer.cpf}`,
    `WhatsApp: ${customer.phone}`,
    `E-mail: ${customer.email}`,
    `Ingressos: ${customer.quantity}`,
    `Valor: ${formatBRL(amount)}`,
    '',
    'Estou enviando o comprovante do PIX para confirmação.',
  ].join('\n')

  const sendReceipt = () => {
    const phone = essenceWhatsApp.replace(/\D/g, '')
    if (!phone) {
      window.alert('O WhatsApp do Essence ainda não foi configurado. Entre em contato com a equipe para concluir a compra.')
      return
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pix-modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="pix-modal-title" className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">PIX para pagamento</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">{customerName ? `${customerName}, escaneie` : 'Escaneie'} o QR Code abaixo ou copie o código</p>
          <p className="mt-1 text-center font-display text-3xl font-bold text-primary">{formatBRL(amount)}</p>
          <div className="mx-auto mt-6 w-fit rounded-xl bg-white p-4"><QRCode value={payload} size={180} level="M" /></div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">PIX Copia e Cola</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"><span className="flex-1 truncate font-mono text-xs text-muted-foreground">{payload}</span></div>
            <button type="button" onClick={copyCode} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
              {copied ? <><Check className="h-4 w-4" /> Código copiado!</> : <><Copy className="h-4 w-4" /> Copiar PIX</>}
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-center text-xs leading-relaxed text-muted-foreground">Após realizar o pagamento, envie o comprovante pelo WhatsApp para confirmar seu ingresso.</p>
            <button type="button" onClick={sendReceipt} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
              <MessageCircle className="h-5 w-5" /> Enviar comprovante pelo WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
