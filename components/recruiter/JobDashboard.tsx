'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Sparkles, CheckCircle2, CalendarClock, Pencil } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/recruiter/StatCard'
import { cn } from '@/lib/utils'
import { scoreLevel } from '@/lib/match'
import type { SerializedJob, ApplicantRow } from '@/lib/recruiter-serializers'

const STATUSES = [
  'APPLIED',
  'REVIEWED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const

type Filter = 'all' | 'strong' | 'recommended' | 'pending'
type Sort = 'score' | 'date' | 'name'

const DISTRIBUTION = [
  { key: 'highly', label: 'Highly Recommended (90-100%)', color: 'bg-success' },
  { key: 'recommended', label: 'Recommended (75-89%)', color: 'bg-primary' },
  { key: 'potential', label: 'Potential Match (60-74%)', color: 'bg-warning' },
  { key: 'low', label: 'Low Alignment (below 60%)', color: 'bg-slate-400' },
] as const

function scoreBadgeClass(score: number | null) {
  const level = scoreLevel(score)
  return level === 'strong'
    ? 'bg-success-light text-success'
    : level === 'medium'
      ? 'bg-primary-light text-primary'
      : 'bg-slate-100 text-slate-600'
}

export function JobDashboard({ job }: { job: SerializedJob }) {
  const router = useRouter()
  const toast = useToast()
  const [applicants, setApplicants] = useState(job.applicants)
  const [isActive, setIsActive] = useState(job.isActive)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('score')

  const maxDist = Math.max(1, ...Object.values(job.distribution))

  const visible = useMemo(() => {
    const filtered = applicants.filter((a) => {
      if (filter === 'strong') return (a.matchScore ?? 0) >= 80
      if (filter === 'recommended') return (a.matchScore ?? 0) >= 60
      if (filter === 'pending') return a.status === 'APPLIED'
      return true
    })
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.candidateName.localeCompare(b.candidateName)
      if (sort === 'date') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      return (b.matchScore ?? -1) - (a.matchScore ?? -1)
    })
  }, [applicants, filter, sort])

  async function toggleJobStatus() {
    try {
      await apiRequest('PATCH', `/api/recruiter/jobs/${job.id}/status`, { isActive: !isActive })
      setIsActive((v) => !v)
      toast.success(isActive ? 'Job closed' : 'Job reopened')
      router.refresh()
    } catch (e) {
      toast.error('Could not update job', (e as Error).message)
    }
  }

  async function updateStatus(app: ApplicantRow, status: string) {
    try {
      await apiRequest('PATCH', `/api/recruiter/applications/${app.applicationId}/status`, { status })
      setApplicants((prev) =>
        prev.map((a) => (a.applicationId === app.applicationId ? { ...a, status } : a)),
      )
      toast.success('Status updated')
      router.refresh()
    } catch (e) {
      toast.error('Could not update status', (e as Error).message)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/recruiter/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-slate-900">{job.title}</h1>
            <Badge variant={isActive ? 'success' : 'neutral'}>{isActive ? 'Active' : 'Closed'}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {job.location && <Badge variant="neutral">{job.location}</Badge>}
            {job.jobType && <Badge variant="neutral">{job.jobType}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/recruiter/jobs/${job.id}/edit`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={toggleJobStatus}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {isActive ? 'Close Job' : 'Reopen Job'}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Applicants" value={job.stats.total} icon={Users} accent="primary" />
        <StatCard label="Analyzed" value={job.stats.analyzed} icon={Sparkles} accent="secondary" />
        <StatCard label="Strong Matches" value={job.stats.strong} icon={CheckCircle2} accent="success" />
        <StatCard label="Interviews" value={job.stats.interviews} icon={CalendarClock} accent="warning" />
      </div>

      {/* Distribution */}
      <Card className="space-y-3 p-6">
        <h2 className="font-display font-semibold text-slate-900">Candidate Distribution</h2>
        {DISTRIBUTION.map((d) => {
          const count = job.distribution[d.key]
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-56 flex-none text-xs text-slate-600">{d.label}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={cn('h-full rounded-full', d.color)} style={{ width: `${(count / maxDist) * 100}%` }} />
              </div>
              <span className="w-6 flex-none text-right text-xs font-semibold text-slate-700">{count}</span>
            </div>
          )
        })}
      </Card>

      {/* Filter + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-border bg-white p-1 text-sm">
          {([['all', 'All'], ['strong', 'Strong Matches'], ['recommended', 'Recommended'], ['pending', 'Pending Review']] as [Filter, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 font-medium transition',
                  filter === key ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {label}
              </button>
            ),
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="score">Match Score</option>
            <option value="date">Application Date</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {/* Applicants */}
      {visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          {applicants.length === 0
            ? 'No applications yet. Share your job posting to start receiving candidates.'
            : 'No candidates match this filter.'}
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <Card key={a.applicationId} className="flex flex-wrap items-center gap-4 p-4">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                {a.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{a.candidateName}</p>
                <p className="truncate text-xs text-muted">{a.primaryRole ?? 'Not yet analyzed'}</p>
                {a.strengthAreas.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {a.strengthAreas.map((s) => (
                      <span key={s} className="rounded-full bg-secondary-light px-2 py-0.5 text-[11px] font-medium text-secondary">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {a.matchScore != null && (
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', scoreBadgeClass(a.matchScore))}>
                  {Math.round(a.matchScore)}% match
                </span>
              )}
              {a.confidenceLevel && (
                <Badge variant={a.confidenceLevel === 'high' ? 'success' : 'warning'}>
                  {a.confidenceLevel === 'high' ? 'High' : a.confidenceLevel === 'medium' ? 'Medium' : 'Low'}
                </Badge>
              )}
              <select
                value={a.status}
                onChange={(e) => updateStatus(a, e.target.value)}
                className="rounded-md border border-border px-2 py-1.5 text-xs font-medium focus:border-primary focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Link
                href={`/recruiter/candidates/${a.candidateId}?job=${job.id}`}
                className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-dark"
              >
                View Profile
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
