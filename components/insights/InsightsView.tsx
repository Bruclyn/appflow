'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/utils'
import type {
  CapabilityInsight,
  DetectedSkillItem,
  FitLevel,
  StrengthLevel,
} from './types'
import { relativeTime } from '@/components/evidence/helpers'

const STRENGTH_PILL: Record<StrengthLevel, { label: string; className: string }> = {
  strong: { label: 'Strong', className: 'bg-success-light text-success' },
  good: { label: 'Good', className: 'bg-primary-light text-primary' },
  emerging: { label: 'Emerging', className: 'bg-warning-light text-warning' },
}

const SKILL_DOT: Record<string, string> = {
  strong: 'bg-success',
  medium: 'bg-warning',
  emerging: 'bg-slate-300',
}

const FIT_VARIANT: Record<FitLevel, 'success' | 'ai' | 'neutral'> = {
  'Strong Fit': 'success',
  'Good Fit': 'ai',
  'Potential Fit': 'neutral',
}

interface InsightsViewProps {
  insight: CapabilityInsight
  reanalyzing: boolean
  onReanalyze: () => void
}

export function InsightsView({
  insight,
  reanalyzing,
  onReanalyze,
}: InsightsViewProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="space-y-6">
      {/* Capability overview */}
      <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display text-[28px] font-bold leading-tight text-primary">
              {insight.primaryRole}
            </span>
            <Badge variant="neutral">{insight.experienceLevel}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {insight.summary}
          </p>
        </div>

        <div className="flex flex-none flex-col items-center gap-2">
          <ProgressRing
            value={insight.overallScore}
            size={100}
            strokeWidth={9}
            indicatorClassName="text-secondary"
          >
            <span className="font-display text-2xl font-bold text-slate-900">
              {insight.overallScore}%
            </span>
          </ProgressRing>
          <span className="text-xs font-medium text-muted">Capability Score</span>
          <Badge variant={insight.confidenceLevel === 'high' ? 'success' : 'warning'}>
            {insight.confidenceLevel === 'high'
              ? 'High Confidence'
              : insight.confidenceLevel === 'medium'
                ? 'Medium Confidence'
                : 'Low Confidence'}
          </Badge>
        </div>
      </Card>

      {/* Strengths + growth */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
            <h3 className="font-display font-semibold text-slate-900">
              Where You Excel
            </h3>
          </div>
          <ul className="mt-4 space-y-4">
            {insight.strengths.length === 0 && (
              <li className="text-sm italic text-muted">
                No standout strengths detected yet.
              </li>
            )}
            {insight.strengths.map((s) => (
              <li key={s.area} className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 flex-none text-success"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {s.area}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        STRENGTH_PILL[s.level]?.className ??
                          'bg-slate-100 text-slate-600',
                      )}
                    >
                      {STRENGTH_PILL[s.level]?.label ?? s.level}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{s.evidence}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" aria-hidden="true" />
            <h3 className="font-display font-semibold text-slate-900">
              Areas to Develop
            </h3>
          </div>
          <ul className="mt-4 space-y-4">
            {insight.growthAreas.length === 0 && (
              <li className="text-sm italic text-muted">
                Nothing pressing — keep building on your strengths.
              </li>
            )}
            {insight.growthAreas.map((g) => (
              <li key={g.area} className="flex gap-3">
                <TrendingUp
                  className="mt-0.5 h-4 w-4 flex-none text-warning"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-slate-900">
                    {g.area}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-500">{g.suggestion}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Detected skills */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-secondary" aria-hidden="true" />
          <h3 className="font-display font-semibold text-slate-900">
            Skills Detected from Evidence
          </h3>
          <Badge variant="ai" className="ml-1">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            AI-Powered
          </Badge>
        </div>
        <SkillGroups skills={insight.detectedSkills} />
      </Card>

      {/* Potential roles */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="font-display font-semibold text-slate-900">
            Roles You Could Target
          </h3>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {insight.potentialRoles.map((role) => (
            <div
              key={role.title}
              className="flex flex-col rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-sm font-semibold text-slate-900">
                  {role.title}
                </span>
                <Badge variant={FIT_VARIANT[role.fitLevel] ?? 'neutral'}>
                  {role.fitLevel}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                {role.reasoning}
              </p>
              <Link
                href="/jobs"
                className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-dark"
              >
                Explore Jobs
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Work patterns */}
      <Card ai className="p-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-secondary" aria-hidden="true" />
          <h3 className="font-display font-semibold text-slate-900">
            Work Patterns
          </h3>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <WorkPatternBox label="Consistency" value={insight.workPatterns.consistency} />
          <WorkPatternBox label="Collaboration" value={insight.workPatterns.collaboration} />
          <WorkPatternBox
            label="Documentation"
            value={insight.workPatterns.documentationQuality}
          />
        </div>
      </Card>

      {/* Re-analyze */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs text-muted">
          Last analyzed {relativeTime(insight.lastAnalyzedAt)}
        </p>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">
              This will replace your current insights. Continue?
            </span>
            <Button
              variant="ai"
              size="sm"
              isLoading={reanalyzing}
              onClick={() => {
                setConfirming(false)
                onReanalyze()
              }}
            >
              Continue
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Re-analyze Profile
          </Button>
        )}
      </div>
    </div>
  )
}

function WorkPatternBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  )
}

function SkillGroups({ skills }: { skills: DetectedSkillItem[] }) {
  if (skills.length === 0) {
    return (
      <p className="mt-3 text-sm italic text-muted">
        No skills detected yet.
      </p>
    )
  }

  const groups = new Map<string, DetectedSkillItem[]>()
  for (const skill of skills) {
    const key = skill.category || 'Other'
    const list = groups.get(key) ?? []
    list.push(skill)
    groups.set(key, list)
  }

  return (
    <div className="mt-4 space-y-4">
      {[...groups.entries()].map(([category, list]) => (
        <div key={category}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {list.map((skill) => (
              <span
                key={skill.name}
                title={skill.evidence}
                className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-slate-700"
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    SKILL_DOT[skill.evidenceStrength] ?? 'bg-slate-300',
                  )}
                  aria-hidden="true"
                />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
