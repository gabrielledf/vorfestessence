import { Beer } from 'lucide-react'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Beer className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold uppercase tracking-wide text-foreground">
            Essence Vorfest
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#atracoes" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            Atrações
          </a>
          <a href="#info" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            Informações
          </a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            FAQ
          </a>
          <a href="/essence" className="text-sm text-muted-foreground transition-colors hover:text-primary">
            Área Essence
          </a>
        </nav>

        <a
          href="#checkout"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          Comprar ingresso
        </a>
      </div>
    </header>
  )
}
