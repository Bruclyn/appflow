'use client'

import { Suspense, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/components/auth/PasswordField'

// Button styling applied to real <Link>s (Button always renders a <button>, and
// an <a> can't legally contain one).
const ghostLink =
  'inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-transparent px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2'
const primaryLink =
  'inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [invalidToken, setInvalidToken] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        // A bad/expired token is the expected failure — show the recovery state.
        if (res.status === 400) {
          setInvalidToken(true)
        } else {
          setError(data.error ?? 'Something went wrong. Please try again.')
        }
        setLoading(false)
        return
      }

      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Missing token in the URL is treated the same as an invalid one.
  const showInvalid = invalidToken || (!token && !done)

  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-xl border border-border bg-white p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="AppFlow home">
            <Logo className="text-2xl" />
          </Link>

          {done ? (
            <>
              <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
                Password updated successfully
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                You can now sign in with your new password.
              </p>
              <Link href="/login" className={`mt-6 ${primaryLink}`}>
                Sign In
              </Link>
            </>
          ) : showInvalid ? (
            <>
              <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-danger-light">
                <XCircle className="h-6 w-6 text-danger" />
              </div>
              <h1 className="mt-4 font-display text-2xl font-bold text-slate-900">
                Reset link expired
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                This reset link is invalid or has expired.
              </p>
              <Link href="/forgot-password" className={`mt-6 ${primaryLink}`}>
                Request a new link
              </Link>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Choose a new password for your account
              </p>
            </>
          )}
        </div>

        {!done && !showInvalid && (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <PasswordField
                id="new-password"
                label="New password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={setPassword}
                placeholder="At least 8 characters"
              />
              <PasswordField
                id="confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={setConfirm}
                placeholder="Re-enter your password"
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
                Reset Password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
