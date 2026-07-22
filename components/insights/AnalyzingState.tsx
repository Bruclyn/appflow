'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const STEPS = [
  'Loading your evidence',
  'Analyzing GitHub repositories',
  'Evaluating project quality',
  'Mapping competencies',
  'Generating your profile',
]

export function AnalyzingState() {
  // Steps complete one-by-one on a 2s cadence; the final step keeps spinning
  // until the real response arrives and this component unmounts.
  const [completed, setCompleted] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setCompleted((n) => (n < STEPS.length ? n + 1 : n))
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary-light/60 via-transparent to-primary-light/60"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-6 px-6 py-14 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-secondary" aria-hidden="true" />
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Analyzing your profile&hellip;
          </h2>
          <p className="mt-1 text-sm text-muted">
            This usually takes 20–40 seconds
          </p>
        </div>

        <ul className="w-full max-w-sm space-y-3 text-left">
          {STEPS.map((label, i) => {
            const isDone = i < completed - 1
            const isActive = i === completed - 1
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-6 w-6 flex-none items-center justify-center rounded-full',
                    isDone
                      ? 'bg-success text-white'
                      : 'bg-secondary-light text-secondary',
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Loader2
                      className={cn('h-4 w-4', isActive && 'animate-spin')}
                      aria-hidden="true"
                    />
                  )}
                </span>
                <span
                  className={cn(
                    'text-sm',
                    isDone ? 'text-slate-700' : 'text-slate-500',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}
