import Link from 'next/link'
import { format } from 'date-fns'
import {
  Briefcase,
  Users,
  Sparkles,
  Clock,
  Plus,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { buildRecruiterDashboard } from '@/lib/recruiter-serializers'
import { relativeTime } from '@/components/evidence/helpers'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/recruiter/StatCard'

export default async function RecruiterDashboardPage() {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) redirect('/login')

  const { stats, recentJobs, topCandidates } = await buildRecruiterDashboard(ctx.profileId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Recruiter Dashboard
          </h1>
          <span className="text-sm text-muted">{format(new Date(), 'EEEE, MMMM d')}</span>
        </div>
        <Link
          href="/recruiter/jobs/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Link>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Jobs" value={stats.activeJobs} icon={Briefcase} accent="primary" />
        <StatCard label="Total Applicants" value={stats.totalApplicants} icon={Users} accent="secondary" />
        <StatCard label="Strong Matches" value={stats.strongMatches} icon={Sparkles} accent="success" />
        <StatCard label="Pending Review" value={stats.pendingReview} icon={Clock} accent="warning" />
      </div>

      {/* Recent jobs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">Your Active Jobs</h2>
          <Link href="/recruiter/jobs" className="text-sm font-medium text-primary hover:underline">
            View All
          </Link>
        </div>

        {recentJobs.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-8 text-center">
            <p className="text-sm text-slate-500">
              No active jobs. Post your first job to start receiving candidates.
            </p>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <Card key={job.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-slate-900">{job.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {job.location && <Badge variant="neutral">{job.location}</Badge>}
                    {job.jobType && <Badge variant="neutral">{job.jobType}</Badge>}
                    <span className="text-xs text-muted">
                      {job.applicantCount} applicant{job.applicantCount === 1 ? '' : 's'} ·{' '}
                      {job.strongMatchCount} strong · {relativeTime(job.createdAt)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/recruiter/jobs/${job.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  View Applicants
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Top candidates */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Top Matches Across All Jobs
        </h2>
        {topCandidates.length === 0 ? (
          <Card className="p-8 text-center text-sm text-slate-500">
            No analyzed candidates yet. Post a job and receive applications to see matches here.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {topCandidates.map((c) => (
              <div key={c.applicationId} className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{c.candidateName}</p>
                  <p className="truncate text-xs text-muted">Applied to {c.jobTitle}</p>
                </div>
                {c.matchScore != null && (
                  <Badge variant="success">{Math.round(c.matchScore)}% match</Badge>
                )}
                <Badge variant="neutral">{c.status}</Badge>
                <Link
                  href={`/recruiter/candidates/${c.candidateId}?job=${c.jobId}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </Card>
        )}
      </section>

      {/* Quick actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <QuickAction href="/recruiter/jobs/new" icon={Plus} label="Post New Job" />
        <QuickAction href="/recruiter/candidates" icon={Users} label="View All Candidates" />
        <QuickAction href="/recruiter/company" icon={Building2} label="Update Company Profile" />
      </section>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: typeof Plus
  label: string
}) {
  return (
    <Link href={href}>
      <Card hover className="flex items-center gap-3 p-5">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary-light text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-900">{label}</span>
        <ArrowRight className="h-4 w-4 text-slate-400" />
      </Card>
    </Link>
  )
}
