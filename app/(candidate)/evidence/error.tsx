'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function EvidenceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[evidence] failed to load', error)
  }, [error])

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Evidence Center
        </h1>
      </header>
      <Card className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-slate-900">
            We couldn’t load your evidence
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Something went wrong while fetching your connected sources. Please
            try again.
          </p>
        </div>
        <Button onClick={reset}>Retry</Button>
      </Card>
    </div>
  )
}
