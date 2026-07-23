import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { serializeCandidateIntelligence } from '@/lib/recruiter-serializers'
import { CandidateProfile } from '@/components/recruiter/CandidateProfile'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ job?: string }>
}

export default async function CandidateIntelligencePage({ params, searchParams }: Props) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) redirect('/login')
  const { id } = await params
  const { job: jobId } = await searchParams

  // Ownership: the candidate must have applied to one of this recruiter's jobs.
  const application = await prisma.application.findFirst({
    where: {
      candidateId: id,
      job: { recruiterId: ctx.profileId },
      ...(jobId ? { jobId } : {}),
    },
    include: { job: { include: { recruiter: true } } },
    orderBy: { matchScore: 'desc' },
  })
  if (!application) redirect('/recruiter/jobs')

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: { user: true, capabilityProfile: true, evidence: true },
  })
  if (!candidate) redirect('/recruiter/jobs')

  const data = serializeCandidateIntelligence(candidate, application)
  return <CandidateProfile data={data} />
}
