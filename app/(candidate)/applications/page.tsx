import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildApplicationsList } from '@/lib/candidate-jobs'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/recruiter/StatCard'
import { ClipboardList, Eye, CalendarClock, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const PIPELINE = ['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'] as const

const STATUS_CLASS: Record<string, string> = {
  APPLIED: 'bg-slate-100 text-slate-600',
  REVIEWED: 'bg-primary-light text-primary',
  SHORTLISTED: 'bg-secondary-light text-secondary',
  INTERVIEW: 'bg-warning-light text-warning',
  OFFER: 'bg-success-light text-success',
  HIRED: 'bg-success text-white',
  REJECTED: 'bg-danger-light text-danger',
}

function scoreClass(score: number | null) {
  if (score == null) return 'bg-slate-100 text-slate-500'
  if (score >= 75) return 'bg-success-light text-success'
  if (score >= 60) return 'bg-primary-light text-primary'
  return 'bg-slate-100 text-slate-600'
}

function Timeline({ status }: { status: string }) {
  if (status === 'REJECTED') {
    return <p className="text-xs font-medium text-danger">Not moving forward</p>
  }
  const currentIndex = PIPELINE.indexOf(status as (typeof PIPELINE)[number])
  return (
    <div className="flex items-center gap-1">
      {PIPELINE.map((stage, i) => (
        <div key={stage} className="flex items-center gap-1">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              i <= currentIndex ? 'bg-primary' : 'bg-slate-200',
            )}
            title={stage}
          />
          {i < PIPELINE.length - 1 && (
            <span className={cn('h-px w-4', i < currentIndex ? 'bg-primary' : 'bg-slate-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

export default async function ApplicationsPage() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) redirect('/login')

  const applications = await buildApplicationsList(ctx.profileId)

  const stats = {
    applied: applications.length,
    review: applications.filter((a) => a.status === 'REVIEWED' || a.status === 'SHORTLISTED').length,
    interviews: applications.filter((a) => a.status === 'INTERVIEW').length,
    offers: applications.filter((a) => a.status === 'OFFER' || a.status === 'HIRED').length,
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">My Applications</h1>
        <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-sm font-semibold text-primary">
          {applications.length}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Applied" value={stats.applied} icon={ClipboardList} accent="primary" />
        <StatCard label="Under Review" value={stats.review} icon={Eye} accent="secondary" />
        <StatCard label="Interviews" value={stats.interviews} icon={CalendarClock} accent="warning" />
        <StatCard label="Offers" value={stats.offers} icon={Trophy} accent="success" />
      </div>

      {applications.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-slate-500">
            No applications yet. Browse jobs and apply to get started.
          </p>
          <Link
            href="/jobs"
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Browse Jobs
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <Card key={a.applicationId} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold text-slate-900">{a.jobTitle}</p>
                <p className="text-sm text-muted">{a.company}</p>
                <p className="mt-1 text-xs text-muted">
                  Applied {format(new Date(a.appliedAt), 'MMM d, yyyy')}
                </p>
                <div className="mt-2">
                  <Timeline status={a.status} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', scoreClass(a.matchScore))}>
                  {a.matchScore != null ? `${a.matchScore}% match` : 'No score'}
                </span>
                <Badge className={cn('font-semibold', STATUS_CLASS[a.status] ?? 'bg-slate-100 text-slate-600')}>
                  {a.status}
                </Badge>
                <Link href="/jobs" className="text-xs font-medium text-primary hover:underline">
                  View Job
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
