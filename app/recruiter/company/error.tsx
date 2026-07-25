'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/ErrorState'

export default function RecruiterCompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[recruiter-company] failed to load', error)
  }, [error])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Company Profile</h1>
      <ErrorState onRetry={reset} message="We couldn't load your company profile. Please try again." />
    </div>
  )
}
