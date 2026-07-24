'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { relativeTime } from '@/components/evidence/helpers'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { initialsOf } from '@/lib/match'
import type { CandidateJobCard, CandidateJobDetail } from '@/lib/candidate-jobs'

const TYPES = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract'] as const
type Sort = 'match' | 'newest' | 'salary'

function scoreClass(score: number | null) {
  if (score == null) return 'bg-slate-100 text-slate-500'
  if (score >= 75) return 'bg-success-light text-success'
  if (score >= 60) return 'bg-primary-light text-primary'
  return 'bg-slate-100 text-slate-600'
}

function salaryLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}`
  return min != null ? `From ${fmt(min)}` : `Up to ${fmt(max as number)}`
}

export function JobDiscovery({
  initialJobs,
  hasProfile,
}: {
  initialJobs: CandidateJobCard[]
  hasProfile: boolean
}) {
  const router = useRouter()
  const toast = useToast()
  const [jobs, setJobs] = useState(initialJobs)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<(typeof TYPES)[number]>('All')
  const [sort, setSort] = useState<Sort>(hasProfile ? 'match' : 'newest')

  const [detail, setDetail] = useState<CandidateJobDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [applying, setApplying] = useState(false)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = jobs.filter((j) => {
      const matchesQuery = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
      const matchesType = type === 'All' || j.jobType === type
      return matchesQuery && matchesType
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === 'salary') return (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0)
      return (b.matchScore ?? -1) - (a.matchScore ?? -1)
    })
  }, [jobs, search, type, sort])

  async function openDetail(id: string) {
    setDetail(null)
    setDetailLoading(true)
    try {
      const d = await apiRequest<CandidateJobDetail>('GET', `/api/candidate/jobs/${id}`)
      setDetail(d)
    } catch (e) {
      toast.error('Could not load job', (e as Error).message)
    } finally {
      setDetailLoading(false)
    }
  }

  async function apply() {
    if (!detail) return
    setApplying(true)
    try {
      const res = await apiRequest<{ matchScore: number | null }>(
        'POST',
        '/api/candidate/jobs/apply',
        { jobId: detail.id },
      )
      setJobs((prev) =>
        prev.map((j) =>
          j.id === detail.id
            ? { ...j, hasApplied: true, applicationStatus: 'APPLIED', matchScore: res.matchScore ?? j.matchScore }
            : j,
        ),
      )
      setDetail((d) => (d ? { ...d, hasApplied: true, applicationStatus: 'APPLIED' } : d))
      toast.success('Application submitted', res.matchScore != null ? `Your match score is ${res.matchScore}%.` : undefined)
      router.refresh()
    } catch (e) {
      toast.error('Could not apply', (e as Error).message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">Job Matches</h1>
        {hasProfile ? (
          <p className="mt-1 text-sm text-slate-500">
            Showing jobs matched to your capability profile
          </p>
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-500">
              Complete your profile to see personalized match scores
            </p>
            <Link
              href="/insights"
              className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-dark"
            >
              Build Profile
            </Link>
          </div>
        )}
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search by title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
          className="h-[42px] rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All types' : t}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-[42px] rounded-md border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none"
        >
          <option value="match">Best Match</option>
          <option value="newest">Newest</option>
          <option value="salary">Salary</option>
        </select>
      </div>

      {/* List */}
      {jobs.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No jobs posted yet. Check back soon.
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          No jobs match your filters. Try adjusting your search.
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => {
            const salary = salaryLabel(job.salaryMin, job.salaryMax)
            return (
              <Card key={job.id} className="flex flex-wrap items-start gap-4 p-5">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                  {initialsOf(job.company)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-slate-900">{job.title}</p>
                  <p className="text-sm text-muted">{job.company}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {job.location && <Badge variant="neutral">{job.location}</Badge>}
                    {job.jobType && <Badge variant="neutral">{job.jobType}</Badge>}
                    {salary && <Badge variant="neutral">{salary}</Badge>}
                  </div>
                  {job.topCompetencies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.topCompetencies.map((c) => (
                        <span key={c} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-muted">Posted {relativeTime(job.createdAt)}</p>
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  <span className={cn('rounded-full px-3 py-1 text-sm font-bold', scoreClass(job.matchScore))}>
                    {job.matchScore != null ? `${job.matchScore}%` : 'No score'}
                  </span>
                  {job.hasApplied ? (
                    <Badge variant="success">Applied · {job.applicationStatus}</Badge>
                  ) : (
                    <Button size="sm" onClick={() => openDetail(job.id)}>View &amp; Apply</Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail drawer */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDetail(null)} aria-hidden="true" />
          <div className="relative h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-elevated">
            <button
              type="button"
              onClick={() => setDetail(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            {detailLoading || !detail ? (
              <p className="mt-10 text-sm text-muted">Loading…</p>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">{detail.title}</h2>
                  <p className="text-sm text-muted">{detail.company}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detail.location && <Badge variant="neutral">{detail.location}</Badge>}
                    {detail.jobType && <Badge variant="neutral">{detail.jobType}</Badge>}
                    {salaryLabel(detail.salaryMin, detail.salaryMax) && (
                      <Badge variant="neutral">{salaryLabel(detail.salaryMin, detail.salaryMax)}</Badge>
                    )}
                  </div>
                </div>

                {detail.match && (
                  <Card className="space-y-3 p-4">
                    <div className="flex items-baseline gap-2">
                      <span className={cn('rounded-full px-3 py-1 font-display text-lg font-bold', scoreClass(detail.match.matchScore))}>
                        {detail.match.matchScore}%
                      </span>
                      <span className="text-sm text-muted">{detail.match.matchCategory}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <MatchCol icon={CheckCircle2} tone="success" title="Strengths" items={detail.match.strengthAreas.map((c) => c.name)} />
                      <MatchCol icon={AlertTriangle} tone="warning" title="Verify" items={detail.match.verifyAreas.map((c) => c.name)} />
                      <MatchCol icon={XCircle} tone="danger" title="Gaps" items={detail.match.gapAreas.map((c) => c.name)} />
                    </div>
                  </Card>
                )}

                <div>
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-700">Description</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{detail.description}</p>
                </div>

                {detail.competencies.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Required Competencies</h3>
                    <ul className="space-y-1.5">
                      {detail.competencies.map((c) => (
                        <li key={c.name} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{c.name}</span>
                          <Badge variant={c.importance === 'Critical' ? 'danger' : c.importance === 'Important' ? 'ai' : 'neutral'}>
                            {c.importance}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detail.hasApplied ? (
                  <div className="rounded-md bg-success-light px-4 py-3 text-sm font-medium text-success">
                    You have applied · {detail.applicationStatus}
                  </div>
                ) : (
                  <Button size="lg" className="w-full" isLoading={applying} onClick={apply}>
                    Apply Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchCol({
  icon: Icon,
  tone,
  title,
  items,
}: {
  icon: typeof CheckCircle2
  tone: 'success' | 'warning' | 'danger'
  title: string
  items: string[]
}) {
  const color = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-danger'
  return (
    <div className="rounded-md border border-border p-3">
      <div className={cn('flex items-center gap-1.5 text-xs font-semibold', color)}>
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-1 text-xs italic text-muted">—</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {items.map((it) => (
            <li key={it} className="text-xs text-slate-600">{it}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
