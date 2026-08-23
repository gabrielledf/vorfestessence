'use client'

import { useState } from 'react'
import { Beer, Menu, X } from 'lucide-react'

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Beer className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="hidden font-display text-lg font-semibold uppercase tracking-wide text-foreground sm:inline">
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

        <div className="flex items-center gap-2">
          <a
            href="#checkout"
            onClick={() => setMenuOpen(false)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 sm:px-5"
          >
            Comprar ingresso
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-border/60 px-4 py-3 md:hidden" aria-label="Navegação principal">
          <div className="mx-auto flex max-w-6xl flex-col">
            <a href="#atracoes" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-card hover:text-primary">Atrações</a>
            <a href="#info" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-card hover:text-primary">Informações</a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-card hover:text-primary">FAQ</a>
            <a href="/essence" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-foreground transition-colors hover:bg-card hover:text-primary">Área Essence</a>
          </div>
        </nav>
      )}
    </header>
  )
}
