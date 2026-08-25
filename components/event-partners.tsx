import { Building2, Handshake, Megaphone, MessageCircle } from 'lucide-react'
import { ESSENCE_WHATSAPP } from '@/lib/event'

const PARTNERS = ['Hellen Chopperia', 'Rotary Club Santa Cruz do Sul Protagon']

export function EventPartners() {
  const advertisingMessage = 'Olá! Tenho interesse em divulgar minha empresa no telão do Essence Vorfest. Gostaria de mais informações.'
  const advertisingUrl = ESSENCE_WHATSAPP
    ? `https://wa.me/${ESSENCE_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(advertisingMessage)}`
    : '#'

  return (
    <section id="parceiros" className="scroll-mt-20 border-y border-border bg-card/40">
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-8">
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
            Realização
          </p>
          <h2 className="mt-1.5 text-balance font-display text-2xl font-bold uppercase text-foreground sm:text-3xl">
            Organização e parceiros
          </h2>
        </div>

        <div className="mx-auto mt-5 grid max-w-3xl gap-3 md:grid-cols-2">
          <article className="rounded-2xl border border-primary/40 bg-background p-4 text-center shadow-sm">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">Promoção</p>
            <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Essence Restaurante e Eventos
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Promotor e organizador oficial do Essence Vorfest.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-background p-4 text-center shadow-sm">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Handshake className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">Parceiros</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {PARTNERS.map((partner) => (
                <span key={partner} className="rounded-full border border-border bg-card px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                  {partner}
                </span>
              ))}
            </div>
          </article>
        </div>

        <a
          href={advertisingUrl}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!ESSENCE_WHATSAPP}
          className={`mx-auto mt-4 flex max-w-3xl items-center gap-3 rounded-2xl border border-primary/50 bg-primary/10 p-3 text-left transition-all hover:border-primary hover:bg-primary/15 ${!ESSENCE_WHATSAPP ? 'pointer-events-none opacity-50' : ''}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Megaphone className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block font-display text-base uppercase tracking-wide text-foreground">Divulgue sua empresa no Essence Vorfest</strong>
            <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">Garanta um espaço para sua marca nas propagandas exibidas durante o evento.</span>
          </span>
          <span className="hidden shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:inline-flex">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Tenho interesse
          </span>
        </a>
      </div>
    </section>
  )
}
