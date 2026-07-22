import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AnalyzePrompt({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-secondary to-primary p-[2px] shadow-elevated">
      <div className="flex flex-col items-center gap-5 rounded-[14px] bg-surface px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-light text-secondary">
          <Sparkles className="h-9 w-9 animate-pulse" aria-hidden="true" />
        </div>
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Ready to analyze your profile
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            You have connected evidence. AppFlow will now analyze your
            repositories, portfolio, and profile to build your capability
            snapshot.
          </p>
        </div>
        <div className="w-full max-w-md">
          <Button variant="ai" size="lg" className="w-full" onClick={onAnalyze}>
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Generate My Insights
          </Button>
          <p className="mt-3 text-xs text-muted">
            This analysis takes 20–40 seconds and uses Claude AI to evaluate
            your real work.
          </p>
        </div>
      </div>
    </div>
  )
}
