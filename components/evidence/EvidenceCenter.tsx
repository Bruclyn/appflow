'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Sparkles } from 'lucide-react'
import { LinkedinIcon } from '@/components/LinkedinIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import type { GitHubAnalysisResult } from '@/lib/github-analysis'
import { SourceCard } from './SourceCard'
import { GitHubSourceCard } from './GitHubSourceCard'
import { PortfolioSourceCard } from './PortfolioSourceCard'
import { AnalysisBanner } from './AnalysisBanner'
import { GitHubResults } from './GitHubResults'
import { PortfolioResults } from './PortfolioResults'
import type { CapabilityView, EvidenceInitial } from './types'

function toCapabilityView(result: GitHubAnalysisResult): CapabilityView {
  return {
    primaryRole: result.primaryRole,
    experienceLevel: result.experienceLevel,
    summary: result.summary,
    detectedSkills: result.detectedSkills ?? [],
    strengthAreas: result.strengthAreas ?? [],
    growthAreas: result.growthAreas ?? [],
    potentialRoles: result.potentialRoles ?? [],
    topLanguages: result.topLanguages ?? [],
    projectHighlights: result.projectHighlights ?? [],
    workPatterns: result.workPatterns ?? null,
  }
}

export function EvidenceCenter({ initial }: { initial: EvidenceInitial }) {
  const router = useRouter()
  const toast = useToast()

  const [github, setGithub] = useState(initial.github)
  const [portfolioUrl, setPortfolioUrl] = useState(initial.portfolioUrl)
  const [capability, setCapability] = useState(initial.capability)
  const [analyzing, setAnalyzing] = useState(false)

  // Surface the outcome of the OAuth redirect, then clean the URL.
  const handledParams = useRef(false)
  useEffect(() => {
    if (handledParams.current) return
    handledParams.current = true

    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')

    if (connected === 'true') {
      toast.success(
        'GitHub connected successfully!',
        'Click Analyze to see your insights.',
      )
    } else if (error === 'github_not_configured') {
      toast.error('GitHub is not configured', 'Please contact support.')
    } else if (error) {
      toast.error('GitHub connection failed', 'Please try again.')
    }

    if (connected || error) {
      window.history.replaceState(null, '', '/evidence')
    }
  }, [toast])

  async function handleReanalyze() {
    setAnalyzing(true)
    try {
      const result = await apiRequest<GitHubAnalysisResult>(
        'POST',
        '/api/evidence/github/analyze',
      )
      setCapability(toCapabilityView(result))
      setGithub((prev) =>
        prev
          ? { ...prev, analyzed: true, analyzedAt: new Date().toISOString() }
          : prev,
      )
      toast.success('Analysis complete', 'Your GitHub insights are ready.')
      router.refresh()
    } catch (e) {
      toast.error('Analysis failed', (e as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleDisconnect() {
    try {
      await apiRequest('DELETE', '/api/evidence/github/disconnect')
      setGithub(null)
      setCapability(null)
      toast.success('GitHub disconnected')
      router.refresh()
    } catch (e) {
      toast.error('Could not disconnect', (e as Error).message)
    }
  }

  async function handleSavePortfolio(url: string): Promise<boolean> {
    try {
      await apiRequest('PUT', '/api/evidence/portfolio', { url })
      setPortfolioUrl(url)
      toast.success('Portfolio saved')
      router.refresh()
      return true
    } catch (e) {
      toast.error('Could not save portfolio', (e as Error).message)
      return false
    }
  }

  async function handleRemovePortfolio() {
    try {
      await apiRequest('DELETE', '/api/evidence/portfolio')
      setPortfolioUrl(null)
      toast.success('Portfolio removed')
      router.refresh()
    } catch (e) {
      toast.error('Could not remove portfolio', (e as Error).message)
    }
  }

  function handlePortfolioAnalyze() {
    toast.info(
      'Portfolio analysis coming soon',
      'We’re building this — check back shortly.',
    )
  }

  const hasNoEvidence = !github && !portfolioUrl
  const showPartialPrompt = !!github && !github.analyzed && !analyzing

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Evidence Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect your work so AppFlow can understand what you can actually do
        </p>
      </header>

      {/* Info banner */}
      <div className="rounded-md border-l-[3px] border-l-secondary bg-secondary-light/50 px-4 py-3 text-sm text-slate-600">
        The more evidence you connect, the more accurately AppFlow can match you
        to relevant opportunities.
      </div>

      {/* Analysis in flight */}
      {analyzing && <AnalysisBanner />}

      {/* Partial: connected but not analyzed */}
      {showPartialPrompt && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border-l-[3px] border-l-primary bg-primary-light px-4 py-3">
          <p className="text-sm text-slate-700">
            Your GitHub is connected. Run an analysis to see your insights.
          </p>
          <Button variant="ai" size="sm" onClick={handleReanalyze}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Analyze Now
          </Button>
        </div>
      )}

      {/* Sources grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <GitHubSourceCard
          configured={initial.githubConfigured}
          github={github}
          analyzing={analyzing}
          onReanalyze={handleReanalyze}
          onDisconnect={handleDisconnect}
        />

        <PortfolioSourceCard
          url={portfolioUrl}
          onSave={handleSavePortfolio}
          onRemove={handleRemovePortfolio}
        />

        <SourceCard
          icon={<LinkedinIcon className="h-6 w-6" />}
          title="LinkedIn"
          description="Import your professional history and endorsements"
          comingSoon
          badge={<Badge variant="warning">Coming Soon</Badge>}
        >
          <button
            type="button"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
          >
            Notify Me
          </button>
        </SourceCard>

        <SourceCard
          icon={<FileText className="h-6 w-6" />}
          title="Document Upload"
          description="Upload a resume or case study for AppFlow to analyze"
          comingSoon
          badge={<Badge variant="warning">Coming Soon</Badge>}
        >
          <button
            type="button"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
          >
            Notify Me
          </button>
        </SourceCard>
      </div>

      {/* Empty state */}
      {hasNoEvidence && (
        <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-center">
          <p className="text-sm text-slate-500">
            Connect your GitHub to get started. AppFlow will analyze your
            repositories and build your capability profile.
          </p>
        </div>
      )}

      {/* GitHub results */}
      {github && github.analyzed && (
        <GitHubResults
          username={github.username}
          repos={github.repos}
          analyzedAt={github.analyzedAt}
          capability={capability}
        />
      )}

      {/* Portfolio results */}
      {portfolioUrl && (
        <PortfolioResults
          url={portfolioUrl}
          analyzed={false}
          onAnalyze={handlePortfolioAnalyze}
        />
      )}
    </div>
  )
}
