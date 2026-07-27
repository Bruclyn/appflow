'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

// Ghost-button styling applied to a real <Link> (Button always renders a <button>).
const ghostLink =
  'inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  // Only populated when there is no email service — lets the flow be tested.
  const [resetUrl, setResetUrl] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        resetUrl?: string
      }

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setResetUrl(data.resetUrl ?? '')
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-xl border border-border bg-white p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="AppFlow home">
            <Logo className="text-2xl" />
          </Link>

          {sent ? (
            <>
              <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                We sent a reset link to{' '}
                <span className="font-medium text-slate-700">{email}</span>. It
                expires in 1 hour.
              </p>

              {resetUrl && (
                <div className="mt-5 w-full rounded-md border border-dashed border-border bg-slate-50 px-4 py-3 text-left">
                  <p className="text-xs font-medium text-slate-500">
                    Testing (no email service configured yet) — open your reset
                    link:
                  </p>
                  <Link
                    href={resetUrl.replace(/^https?:\/\/[^/]+/, '')}
                    className="mt-1 block break-all text-xs font-medium text-primary hover:underline"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}

              <Link href="/login" className={`mt-6 ${ghostLink}`}>
                Back to Sign In
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
                Reset your password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Enter your email address and we will send you a reset link
              </p>
            </>
          )}
        </div>

        {!sent && (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={loading}>
                Send Reset Link
              </Button>
            </form>

            <Link href="/login" className={`mt-4 ${ghostLink}`}>
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
