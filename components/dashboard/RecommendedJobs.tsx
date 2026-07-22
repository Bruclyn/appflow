import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export interface JobMatch {
  id: string
  title: string
  company: string | null
  matchScore: number | null
  reason: string | null
}

export function RecommendedJobs({ jobs }: { jobs: JobMatch[] }) {
  return (
    <Card className="flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">
          Your Top Matches
        </h2>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Briefcase className="h-12 w-12 text-slate-300" />
          <p className="mt-4 font-semibold text-slate-900">No matches yet</p>
          <p className="mt-1 max-w-xs text-sm text-slate-500">
            Complete your profile and connect your evidence to discover matched
            opportunities
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center gap-3 rounded-md border border-border p-3"
            >
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                {(job.company ?? job.title).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {job.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {job.company ?? 'Company'}
                </p>
                {job.reason && (
                  <p className="truncate text-xs text-slate-400">{job.reason}</p>
                )}
              </div>
              {job.matchScore != null && (
                <Badge variant="success">{Math.round(job.matchScore)}% Match</Badge>
              )}
              <Link
                href={`/jobs/${job.id}`}
                className="flex-none rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
