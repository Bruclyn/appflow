import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildJobList } from '@/lib/candidate-jobs'
import { JobDiscovery } from '@/components/jobs/JobDiscovery'

export default async function JobsPage() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) redirect('/login')

  const [jobs, capability] = await Promise.all([
    buildJobList(ctx.profileId),
    prisma.capabilityProfile.findUnique({
      where: { candidateId: ctx.profileId },
      select: { overallScore: true },
    }),
  ])
  const hasProfile = !!capability && capability.overallScore != null

  return <JobDiscovery initialJobs={jobs} hasProfile={hasProfile} />
}
