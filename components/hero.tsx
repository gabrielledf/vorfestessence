'use client'

import { useState } from 'react'
import { CalendarDays, Clock, MapPin, MessageCircle, Ticket } from 'lucide-react'
import { ESSENCE_WHATSAPP, EVENT } from '@/lib/event'
import { LocationModal } from '@/components/location-modal'

export function Hero() {
  const [mapOpen, setMapOpen] = useState(false)
  const contactMessage = 'Olá! Tenho uma dúvida sobre o Essence Vorfest.'
  const contactUrl = ESSENCE_WHATSAPP
    ? `https://wa.me/${ESSENCE_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(contactMessage)}`
    : '#'

  return (
    <>
      <section id="top" className="relative overflow-hidden">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <img
          src="/hero-vorfest.png"
          alt="Ambiente da Oktoberfest indoor no Essence Restaurante e Eventos com chopp gelado e luzes douradas"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Ticket className="h-4 w-4" aria-hidden="true" />
          Vagas limitadas — apenas {EVENT.totalTickets} ingressos
        </span>

        <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-6xl">
          Essence Vorfest
          <span className="mt-2 block text-primary">{EVENT.tagline}</span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          Uma noite de bandas típicas alemãs, open food com tradicional gastronomia alemã, open bar com espumante e chopp Hellen liberados.
        </p>

        {/* Detalhes do evento */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <InfoPill icon={CalendarDays} label={EVENT.date} />
          <InfoPill icon={Clock} label={EVENT.time} />
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur transition-colors hover:border-primary/60 hover:bg-card"
          >
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            {EVENT.location}
          </button>
          <a
            href={contactUrl}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!ESSENCE_WHATSAPP}
            onClick={(event) => { if (!ESSENCE_WHATSAPP) event.preventDefault() }}
            className={`inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur transition-colors hover:border-primary/60 hover:bg-card ${!ESSENCE_WHATSAPP ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            Contato
          </a>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#checkout"
            className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105"
          >
            Garantir meu ingresso
          </a>
          <a
            href="#atracoes"
            className="rounded-full border border-border px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-card"
          >
            Ver atrações
          </a>
        </div>
      </div>

      </section>

      <LocationModal open={mapOpen} onClose={() => setMapOpen(false)} />
    </>
  )
}

function InfoPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-foreground backdrop-blur">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      {label}
    </span>
  )
}
