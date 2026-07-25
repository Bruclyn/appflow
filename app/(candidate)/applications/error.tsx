'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

export default function ApplicationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[applications] failed to load', error)
  }, [error])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">My Applications</h1>
      <ErrorState onRetry={reset} message="We couldn't load your applications. Please try again." />
    </div>
  )
}
