'use client'

import { useState } from 'react'
import { Beer, Globe, MapPin, Phone, Send } from 'lucide-react'
import { ESSENCE_WHATSAPP, EVENT } from '@/lib/event'
import { LocationModal } from '@/components/location-modal'

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  const local = digits.startsWith('55') ? digits.slice(2) : digits
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  return phone
}

export function SiteFooter() {
  const [mapOpen, setMapOpen] = useState(false)
  const whatsappUrl = ESSENCE_WHATSAPP ? `https://wa.me/${ESSENCE_WHATSAPP.replace(/\D/g, '')}` : '#'

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-7 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:items-start">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Beer className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-base font-semibold uppercase tracking-wide text-foreground">
              {EVENT.name}
            </p>
            <p className="text-xs text-muted-foreground">{EVENT.tagline}</p>
          </div>
        </div>

        <button type="button" onClick={() => setMapOpen(true)} className="flex items-start gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-primary">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>{EVENT.address}</span>
        </button>

        <a
          href="https://www.instagram.com/essencerestaurante/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          @essencerestaurante
        </a>

        <div className="space-y-3 text-sm">
          <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={(event) => { if (!ESSENCE_WHATSAPP) event.preventDefault() }} className={`flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary ${!ESSENCE_WHATSAPP ? 'cursor-not-allowed opacity-50' : ''}`}>
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            {ESSENCE_WHATSAPP ? formatPhone(ESSENCE_WHATSAPP) : 'Telefone não configurado'}
          </a>
          <a href="https://essencerestaurante.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
            <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
            essencerestaurante.vercel.app
          </a>
        </div>
      </div>

      <div className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} {EVENT.venue}. Todos os direitos reservados.
        </p>
      </div>
      <LocationModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </footer>
  )
}
