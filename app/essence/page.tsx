'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EssenceLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.')
      router.push('/admin')
      router.refresh()
    } catch (reason) {
      setError((reason as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-card/40 px-4 py-12">
      <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-border bg-background p-7 shadow-xl sm:p-8">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-primary">Área administrativa</p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase text-foreground">Gestão de ingressos</h1>
        <p className="mt-3 text-sm text-muted-foreground">Acesso restrito à equipe do Essence.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60" />
          </label>
          <label className="block text-sm font-medium text-foreground">Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required className="mt-1.5 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/60" />
          </label>
        </div>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <button disabled={loading} className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
