'use client'

import { Check, Copy, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { formatBRL } from '@/lib/format'

interface PixModalProps {
  open: boolean
  onClose: () => void
  payload: string
  amount: number
  customerName: string
}

const EXPIRE_SECONDS = 15 * 60

export function PixModal({ open, onClose, payload, amount, customerName }: PixModalProps) {
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(EXPIRE_SECONDS)

  // Reinicia o cronômetro toda vez que o modal abre
  useEffect(() => {
    if (!open) return
    setSecondsLeft(EXPIRE_SECONDS)
    setCopied(false)
  }, [open])

  // Contagem regressiva
  useEffect(() => {
    if (!open || secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [open, secondsLeft])

  // Fecha com a tecla ESC
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const expired = secondsLeft <= 0

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback silencioso
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pix-modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 id="pix-modal-title" className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
            Pague com PIX
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <p className="text-center text-sm text-muted-foreground">
            {customerName ? `${customerName}, escaneie` : 'Escaneie'} o QR Code abaixo ou copie o código
          </p>
          <p className="mt-1 text-center font-display text-3xl font-bold text-primary">
            {formatBRL(amount)}
          </p>

          {/* QR Code */}
          <div className="mx-auto mt-6 w-fit rounded-xl bg-white p-4">
            {expired ? (
              <div className="flex h-[180px] w-[180px] items-center justify-center text-center text-sm text-neutral-500">
                Código expirado. Feche e gere um novo.
              </div>
            ) : (
              <QRCode value={payload} size={180} level="M" />
            )}
          </div>

          {/* Cronômetro */}
          <div className="mt-5 flex items-center justify-center gap-2 text-sm">
            <Loader2
              className={`h-4 w-4 text-primary ${expired ? '' : 'animate-spin'}`}
              aria-hidden="true"
            />
            <span className={expired ? 'text-destructive' : 'text-muted-foreground'}>
              {expired
                ? 'Tempo esgotado'
                : `Expira em ${minutes}:${seconds.toString().padStart(2, '0')}`}
            </span>
          </div>

          {/* Copia e cola */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              PIX Copia e Cola
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                {payload}
              </span>
            </div>
            <button
              type="button"
              onClick={copyCode}
              disabled={expired}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Código copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copiar código PIX
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
            Após o pagamento, a confirmação é automática e o voucher é enviado para o seu WhatsApp.
          </p>
        </div>
      </div>
    </div>
  )
}
