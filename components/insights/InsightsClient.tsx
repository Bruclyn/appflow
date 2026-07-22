'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { EmptyState } from './EmptyState'
import { AnalyzePrompt } from './AnalyzePrompt'
import { AnalyzingState } from './AnalyzingState'
import { InsightsView } from './InsightsView'
import type { CapabilityInsight, InsightsInitial } from './types'

export function InsightsClient({ initial }: { initial: InsightsInitial }) {
  const router = useRouter()
  const toast = useToast()

  const [insight, setInsight] = useState<CapabilityInsight | null>(initial.insight)
  const [analyzing, setAnalyzing] = useState(false)

  async function runAnalysis() {
    setAnalyzing(true)
    try {
      const result = await apiRequest<CapabilityInsight>(
        'POST',
        '/api/insights/analyze',
      )
      setInsight(result)
      toast.success('Analysis complete', 'Your capability profile is ready.')
      router.refresh()
    } catch (e) {
      toast.error('Analysis failed', (e as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-secondary" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold text-slate-900">
            AI Insights
          </h1>
        </div>
        <span className="rounded-full bg-secondary-light px-2.5 py-0.5 text-xs font-semibold text-secondary">
          Powered by Claude AI
        </span>
        <p className="w-full text-sm text-slate-500">
          Your capability profile powered by evidence analysis
        </p>
      </header>

      {/* State machine */}
      {analyzing ? (
        <AnalyzingState />
      ) : insight ? (
        <InsightsView
          insight={insight}
          reanalyzing={analyzing}
          onReanalyze={runAnalysis}
        />
      ) : initial.hasEvidence ? (
        <AnalyzePrompt onAnalyze={runAnalysis} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
