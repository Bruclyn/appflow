import { redirect } from 'next/navigation'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { listRecruiterJobs } from '@/lib/recruiter-serializers'
import { JobsList } from '@/components/recruiter/JobsList'

export default async function RecruiterJobsPage() {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) redirect('/login')

  const jobs = await listRecruiterJobs(ctx.profileId)
  return <JobsList initialJobs={jobs} />
}
