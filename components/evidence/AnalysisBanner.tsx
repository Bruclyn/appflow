import { Loader2 } from 'lucide-react'

/**
 * Full-width status banner shown while a GitHub analysis request is in flight.
 */
export function AnalysisBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-4 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 p-5 text-white shadow-elevated"
    >
      <Loader2 className="mt-0.5 h-6 w-6 flex-none animate-spin" aria-hidden="true" />
      <div>
        <p className="font-display text-base font-semibold">
          Analyzing your GitHub repositories&hellip;
        </p>
        <p className="mt-1 text-sm text-white/80">
          This may take up to 30 seconds. You can navigate away and come back.
        </p>
      </div>
    </div>
  )
}
