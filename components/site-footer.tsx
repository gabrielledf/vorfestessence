import { Beer, MapPin, Send } from 'lucide-react'
import { EVENT } from '@/lib/event'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
          {EVENT.venue} — {EVENT.date}
        </div>

        <a
          href="#top"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          @restauranteessence
        </a>
      </div>

      <div className="border-t border-border py-4">
        <p className="text-center text-xs text-muted-foreground">
          {new Date().getFullYear()} {EVENT.venue}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
