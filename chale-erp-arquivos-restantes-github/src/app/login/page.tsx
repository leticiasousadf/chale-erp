'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const authResult =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })

      if (authResult.error) {
        setErrorMessage(getAuthErrorMessage(authResult.error.message))
        return
      }

      if (mode === 'signup' && !authResult.data.session) {
        setMessage('Conta criada. Confira seu email para confirmar o acesso.')
        return
      }

      router.replace('/')
      router.refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel conectar ao Supabase.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setMessage('')
    setErrorMessage('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 text-5xl" aria-hidden="true">
            🏡
          </div>
          <h1 className="text-2xl font-bold">Chalé ERP</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gestão da construção</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
              onClick={() => switchMode('signup')}
            >
              Criar conta
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-muted-foreground">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo de 6 caracteres"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function getAuthErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('invalid login credentials')) {
    return 'Email ou senha incorretos.'
  }

  if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
    return 'Este email ja esta cadastrado. Tente entrar.'
  }

  if (lowerMessage.includes('password')) {
    return 'A senha precisa ter pelo menos 6 caracteres.'
  }

  return 'Nao foi possivel concluir. Verifique os dados e tente novamente.'
}
