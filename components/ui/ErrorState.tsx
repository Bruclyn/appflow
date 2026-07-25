import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

/** Shared body for every route's error.tsx — a centered card with a Retry button. */
export function ErrorState({
  message = 'Something went wrong while loading this page. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light text-danger">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-base font-semibold text-slate-900">
          Something went wrong
        </p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
      <Button onClick={onRetry}>Retry</Button>
    </Card>
  )
}
