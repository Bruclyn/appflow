'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Briefcase, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleIcon } from '@/components/GoogleIcon'
import { PasswordField } from '@/components/auth/PasswordField'
import { cn } from '@/lib/utils'

type Role = 'CANDIDATE' | 'RECRUITER'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('CANDIDATE')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Could not create your account.')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Account created but auto sign-in failed — send them to login.
        router.push('/login')
        return
      }

      router.push(role === 'CANDIDATE' ? '/dashboard' : '/recruiter/dashboard')
      router.refresh()
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
          <h1 className="mt-6 font-display text-2xl font-bold text-slate-900">
            Create your account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <fieldset>
            <legend className="sr-only">I want to</legend>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                selected={role === 'RECRUITER'}
                onClick={() => setRole('RECRUITER')}
                icon={Briefcase}
                title="I want to hire talent"
                subtitle="For recruiters and companies"
              />
              <RoleCard
                selected={role === 'CANDIDATE'}
                onClick={() => setRole('CANDIDATE')}
                icon={User}
                title="I'm looking for opportunities"
                subtitle="For candidates and job seekers"
              />
            </div>
          </fieldset>

          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Johnson"
          />
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <PasswordField
            label="Password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
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
            Create Account
          </Button>
        </form>

        <Divider />

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
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function RoleCard({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  selected: boolean
  onClick: () => void
  icon: LucideIcon
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex flex-col items-start gap-2 rounded-md border p-4 text-left transition',
        selected
          ? 'border-primary bg-primary-light'
          : 'border-border bg-white hover:border-slate-300',
      )}
    >
      <Icon
        className={cn('h-5 w-5', selected ? 'text-primary' : 'text-slate-400')}
      />
      <span className="text-sm font-semibold leading-tight text-slate-900">
        {title}
      </span>
      <span className="text-xs leading-snug text-slate-500">{subtitle}</span>
    </button>
  )
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        or
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
