'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

export default function RecruiterDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[recruiter-dashboard] failed to load', error)
  }, [error])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
      <ErrorState onRetry={reset} message="We couldn't load your dashboard. Please try again." />
    </div>
  )
}
