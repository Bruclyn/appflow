'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Pencil, Users } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { relativeTime } from '@/components/evidence/helpers'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { JobSummary } from '@/lib/recruiter-serializers'

type Filter = 'all' | 'active' | 'closed'

function salaryLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}k`
  if (min != null && max != null) return `${fmt(min)}–${fmt(max)}`
  return min != null ? `From ${fmt(min)}` : `Up to ${fmt(max as number)}`
}

export function JobsList({ initialJobs }: { initialJobs: JobSummary[] }) {
  const router = useRouter()
  const toast = useToast()
  const [jobs, setJobs] = useState(initialJobs)
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const visible = jobs.filter((j) =>
    filter === 'all' ? true : filter === 'active' ? j.isActive : !j.isActive,
  )

  async function toggleStatus(job: JobSummary) {
    setBusyId(job.id)
    try {
      await apiRequest('PATCH', `/api/recruiter/jobs/${job.id}/status`, {
        isActive: !job.isActive,
      })
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j)),
      )
      toast.success(job.isActive ? 'Job closed' : 'Job reopened')
      router.refresh()
    } catch (e) {
      toast.error('Could not update job', (e as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  async function remove(job: JobSummary) {
    setBusyId(job.id)
    try {
      await apiRequest('DELETE', `/api/recruiter/jobs/${job.id}`)
      setJobs((prev) => prev.filter((j) => j.id !== job.id))
      toast.success('Job deleted')
      router.refresh()
    } catch (e) {
      toast.error('Could not delete job', (e as Error).message)
    } finally {
      setBusyId(null)
      setConfirmingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">My Jobs</h1>
        <Link
          href="/recruiter/jobs/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Link>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-full border border-border bg-white p-1 text-sm">
        {(['all', 'active', 'closed'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'flex-1 rounded-full px-4 py-1.5 font-medium capitalize transition',
              filter === f ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          {filter === 'closed'
            ? 'No closed jobs.'
            : filter === 'active'
              ? 'No active jobs. Post a job to start receiving candidates.'
              : 'No jobs yet. Post your first job to start receiving candidates.'}
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((job) => {
            const salary = salaryLabel(job.salaryMin, job.salaryMax)
            return (
              <Card key={job.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-base font-semibold text-slate-900">
                        {job.title}
                      </p>
                      <Badge variant={job.isActive ? 'success' : 'neutral'}>
                        {job.isActive ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {job.location && <Badge variant="neutral">{job.location}</Badge>}
                      {job.jobType && <Badge variant="neutral">{job.jobType}</Badge>}
                      {salary && <Badge variant="neutral">{salary}</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'} ·{' '}
                      {job.strongMatchCount} strong match
                      {job.strongMatchCount === 1 ? '' : 'es'} · Posted{' '}
                      {relativeTime(job.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleStatus(job)}
                      disabled={busyId === job.id}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      {job.isActive ? 'Close' : 'Reopen'}
                    </button>
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary-dark"
                    >
                      <Users className="h-3.5 w-3.5" />
                      View Applicants
                    </Link>
                    <Link
                      href={`/recruiter/jobs/${job.id}/edit`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {confirmingId === job.id ? (
                      <span className="flex items-center gap-1.5">
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={busyId === job.id}
                          onClick={() => remove(job)}
                        >
                          Confirm
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmingId(null)}>
                          Cancel
                        </Button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingId(job.id)}
                        aria-label="Delete job"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-danger transition hover:bg-danger-light"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
