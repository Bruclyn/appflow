import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { serializeJobWithApplicants } from '@/lib/recruiter-serializers'
import { JobDashboard } from '@/components/recruiter/JobDashboard'

type Params = { params: Promise<{ id: string }> }

export default async function JobDashboardPage({ params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) redirect('/login')
  const { id } = await params

  const job = await prisma.job.findFirst({
    where: { id, recruiterId: ctx.profileId },
    include: {
      applications: {
        include: {
          candidate: { include: { user: true, capabilityProfile: true } },
        },
      },
    },
  })
  if (!job) redirect('/recruiter/jobs')

  return <JobDashboard job={serializeJobWithApplicants(job)} />
}
