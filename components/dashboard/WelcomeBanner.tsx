'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'appflow:dashboard-welcome-dismissed'

export function WelcomeBanner({ firstName }: { firstName: string }) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '1') setDismissed(true)
  }, [])

  if (dismissed) return null

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-6 text-white shadow-card">
      <button
        type="button"
        aria-label="Dismiss welcome message"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, '1')
          setDismissed(true)
        }}
        className="absolute right-4 top-4 text-white/80 transition hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>
      <h2 className="font-display text-xl font-bold">
        Welcome to AppFlow, {firstName}! 👋
      </h2>
      <p className="mt-1 max-w-xl text-sm text-white/90">
        Start by building your profile so our AI can match you with the right
        opportunities.
      </p>
      <Link
        href="/profile"
        className="mt-4 inline-flex h-10 items-center rounded-full border border-white/30 bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
      >
        Build My Profile
      </Link>
    </div>
  )
}
