'use client'

import { useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import { EVENT } from '@/lib/event'

export function LocationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(EVENT.address)}&output=embed`
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.address)}`

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open])

  if (!open) return null

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="map-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Local do evento</p>
            <h2 id="map-title" className="mt-1 font-display text-2xl font-bold uppercase text-foreground">Essence Restaurante e Eventos</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{EVENT.address}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar mapa" className="rounded-full border border-border p-2 text-foreground transition-colors hover:bg-card">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <iframe src={mapUrl} title="Mapa do Essence Restaurante e Eventos" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[380px] w-full border-y border-border sm:h-[460px]" />
        <div className="p-5 text-center sm:p-6">
          <a href={mapsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Abrir rota no Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
