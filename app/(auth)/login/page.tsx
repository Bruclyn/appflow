'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleIcon } from '@/components/GoogleIcon'
import { PasswordField } from '@/components/auth/PasswordField'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (!result || result.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    // Session cookie is set — read the role to route to the right dashboard.
    const session = await getSession()
    const role = session?.user?.role
    router.push(role === 'RECRUITER' ? '/recruiter/dashboard' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-[480px]">
      <div className="rounded-xl border border-border bg-white p-8 shadow-card">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label="AppFlow home">
            <Logo className="text-2xl" />
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to your AppFlow account
          </p>
        </div>

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

          <div>
            <PasswordField
              label="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={setPassword}
              placeholder="Your password"
            />
            <div className="mt-1.5 text-right">
              <Link
                href="#"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full border border-border"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
