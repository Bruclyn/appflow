import { ExternalLink, Sparkles, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { CapabilityView, RepoLite } from './types'
import {
  computeLanguageBreakdown,
  earliestYear,
  languageColor,
  relativeTime,
  topLanguage,
} from './helpers'

interface GitHubResultsProps {
  username: string
  repos: RepoLite[]
  analyzedAt: string | null
  capability: CapabilityView | null
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function LanguageDot({ language }: { language: string | null }) {
  if (!language) {
    return <span className="h-2.5 w-2.5 flex-none rounded-full bg-slate-300" />
  }
  return (
    <span
      className="h-2.5 w-2.5 flex-none rounded-full"
      style={{ backgroundColor: languageColor(language) }}
    />
  )
}

function RepoCard({ repo }: { repo: RepoLite }) {
  return (
    <a
      href={repo.htmlUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-md border border-border bg-surface p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="flex items-center gap-1.5">
        <span className="truncate font-display text-sm font-semibold text-slate-900 group-hover:text-primary">
          {repo.name}
        </span>
        <ExternalLink className="h-3.5 w-3.5 flex-none text-slate-400" aria-hidden="true" />
      </div>

      {repo.description ? (
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
          {repo.description}
        </p>
      ) : (
        <p className="mt-1.5 line-clamp-2 text-sm italic text-slate-400">
          No description provided
        </p>
      )}

      <div className="mt-auto flex items-center gap-4 pt-3 text-xs text-slate-500">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <LanguageDot language={repo.language} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          {repo.stars}
        </span>
        <span className="ml-auto">Updated {relativeTime(repo.updatedAt)}</span>
      </div>
    </a>
  )
}

export function GitHubResults({
  username,
  repos,
  analyzedAt,
  capability,
}: GitHubResultsProps) {
  const breakdown = computeLanguageBreakdown(repos)
  const topRepos = [...repos]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
  const activeSince = earliestYear(repos)
  const primaryLanguage = topLanguage(repos)

  const hasCapability =
    !!capability &&
    (!!capability.primaryRole ||
      !!capability.summary ||
      capability.detectedSkills.length > 0 ||
      capability.strengthAreas.length > 0)

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          GitHub Analysis Results
        </h2>
        <span className="text-sm text-slate-400">@{username}</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Repositories" value={String(repos.length)} />
        <StatCard label="Top Language" value={primaryLanguage ?? '—'} />
        <StatCard
          label="Active Since"
          value={activeSince ? String(activeSince) : '—'}
        />
        <StatCard label="Analyzed" value={relativeTime(analyzedAt)} />
      </div>

      {/* Repository grid */}
      {topRepos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {topRepos.map((repo) => (
            <RepoCard key={repo.name} repo={repo} />
          ))}
        </div>
      )}

      {/* Language breakdown */}
      {breakdown.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Language Breakdown
          </h3>
          <div className="flex h-8 w-full overflow-hidden rounded-full border border-border">
            {breakdown.map((slice) => (
              <div
                key={slice.name}
                className="h-full"
                style={{ width: `${slice.percent}%`, backgroundColor: slice.color }}
                title={`${slice.name} — ${slice.percent}%`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {breakdown.map((slice) => (
              <span
                key={slice.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                <LanguageDot language={slice.name} />
                {slice.name}
                <span className="text-slate-400">{slice.percent}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill signals (AI) */}
      <Card ai className="p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" aria-hidden="true" />
          <h3 className="font-display text-sm font-semibold text-slate-900">
            Skills Detected from GitHub
          </h3>
        </div>
        {capability && capability.detectedSkills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {capability.detectedSkills.map((skill) => (
              <span
                key={skill.name}
                title={skill.evidence}
                className="inline-flex cursor-default items-center gap-1 rounded-full bg-secondary-light px-3 py-1 text-xs font-semibold text-secondary"
              >
                {skill.name}
                {skill.strength && (
                  <span className="font-normal text-secondary/70">
                    · {skill.strength}
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm italic text-slate-400">
            Connect and analyze your GitHub to see detected skills.
          </p>
        )}
      </Card>

      {/* Capability summary */}
      {hasCapability && capability && (
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              AI Assessment
            </h3>
            <Badge variant="ai">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              AI
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {capability.primaryRole && (
              <span className="rounded-full bg-primary-light px-3 py-1 text-sm font-semibold text-primary">
                {capability.primaryRole}
              </span>
            )}
            {capability.experienceLevel && (
              <Badge variant="neutral">{capability.experienceLevel}</Badge>
            )}
          </div>

          {capability.summary && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {capability.summary}
            </p>
          )}

          {(capability.strengthAreas.length > 0 ||
            capability.growthAreas.length > 0 ||
            capability.potentialRoles.length > 0) && (
            <div className="mt-4 space-y-3">
              {capability.strengthAreas.length > 0 && (
                <PillRow
                  label="Strengths"
                  items={capability.strengthAreas}
                  className="bg-success-light text-success"
                />
              )}
              {capability.growthAreas.length > 0 && (
                <PillRow
                  label="Growth areas"
                  items={capability.growthAreas}
                  className="bg-warning-light text-warning"
                />
              )}
              {capability.potentialRoles.length > 0 && (
                <PillRow
                  label="Potential roles"
                  items={capability.potentialRoles}
                  className="bg-primary-light text-primary"
                />
              )}
            </div>
          )}
        </Card>
      )}
    </section>
  )
}

function PillRow({
  label,
  items,
  className,
}: {
  label: string
  items: string[]
  className: string
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              className,
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
