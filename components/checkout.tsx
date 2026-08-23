'use client'

import { Minus, Plus, Ticket } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PixModal } from '@/components/pix-modal'
import { ESSENCE_WHATSAPP, EVENT, PIX_RECEIVER } from '@/lib/event'
import { formatBRL, isValidCPF, isValidPhone, maskCPF, maskPhone } from '@/lib/format'
import { generatePixPayload } from '@/lib/pix'

interface FormErrors {
  name?: string
  phone?: string
  cpf?: string
  email?: string
}

export function Checkout() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [errors, setErrors] = useState<FormErrors>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [payload, setPayload] = useState('')
  const [txid, setTxid] = useState('')

  const total = quantity * EVENT.ticketPrice

  const changeQuantity = (delta: number) => {
    setQuantity((q) => Math.min(EVENT.maxPerOrder, Math.max(1, q + delta)))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (name.trim().length < 3) next.name = 'Informe seu nome completo.'
    if (!isValidPhone(phone)) next.phone = 'Informe um celular completo com DDD: (00) 90000-0000.'
    if (!isValidCPF(cpf)) next.cpf = 'Informe um CPF válido.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Informe um e-mail válido.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const txid = `VORFEST${Date.now().toString(36)}`.toUpperCase().slice(0, 25)
    const code = generatePixPayload({
      pixKey: PIX_RECEIVER.key,
      merchantName: PIX_RECEIVER.name,
      merchantCity: PIX_RECEIVER.city,
      amount: total,
      txid,
    })
    setPayload(code)
    setTxid(txid)
    setModalOpen(true)
  }

  const summary = useMemo(
    () => [
      { label: 'Valor por ingresso', value: formatBRL(EVENT.ticketPrice) },
      { label: 'Quantidade', value: `${quantity}x` },
    ],
    [quantity],
  )

  return (
    <section id="checkout" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Garanta seu lugar
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
            Compre seu ingresso
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm text-muted-foreground">
            Preencha seus dados, pague via PIX e envie o comprovante pelo WhatsApp para confirmar seu ingresso.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Formulário */}
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            noValidate
            className="rounded-2xl border border-border bg-background p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5">
              <Field
                id="name"
                label="Nome completo"
                value={name}
                onChange={setName}
                placeholder="Seu nome completo"
                error={errors.name}
                autoComplete="name"
              />
              <Field
                id="phone"
                label="WhatsApp"
                value={phone}
                onChange={(v) => setPhone(maskPhone(v))}
                placeholder="(00) 00000-0000"
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
              />
              <Field
                id="cpf"
                label="CPF"
                value={cpf}
                onChange={(v) => setCpf(maskCPF(v))}
                placeholder="000.000.000-00"
                error={errors.cpf}
                inputMode="numeric"
              />
              <Field
                id="email"
                label="E-mail"
                value={email}
                onChange={setEmail}
                placeholder="voce@exemplo.com"
                error={errors.email}
                inputMode="email"
                autoComplete="email"
              />

              {/* Quantidade */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Quantidade de ingressos
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      disabled={quantity <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-background disabled:opacity-40"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-display text-lg font-semibold text-foreground">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(1)}
                      disabled={quantity >= EVENT.maxPerOrder}
                      className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-background disabled:opacity-40"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Máx. {EVENT.maxPerOrder} por compra
                  </span>
                </div>
              </div>
            </div>
          </form>

          {/* Resumo */}
          <div className="flex flex-col rounded-2xl border border-primary/30 bg-background p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Resumo do pedido
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {summary.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <div className="flex items-end justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-3xl font-bold text-primary">
                  {formatBRL(total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
            >
              <Ticket className="h-5 w-5" />
              Comprar ingresso
            </button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Após o pagamento, envie o comprovante pelo WhatsApp para confirmar seu ingresso.
            </p>
          </div>
        </div>
      </div>

      <PixModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        payload={payload}
        txid={txid}
        amount={total}
        customerName={name.trim().split(' ')[0]}
        customer={{ name: name.trim(), cpf, phone, email: email.trim(), quantity }}
        essenceWhatsApp={ESSENCE_WHATSAPP}
      />
    </section>
  )
}

interface FieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  inputMode?: 'text' | 'tel' | 'numeric' | 'email'
  autoComplete?: string
}

function Field({ id, label, value, onChange, placeholder, error, inputMode, autoComplete }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/60 ${
          error ? 'border-destructive' : 'border-border'
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
