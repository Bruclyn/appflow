import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'
import { serializeCandidateIntelligence } from '@/lib/recruiter-serializers'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params
  const jobId = new URL(req.url).searchParams.get('job')

  // The candidate must have applied to at least one of this recruiter's jobs.
  const application = await prisma.application.findFirst({
    where: {
      candidateId: id,
      job: { recruiterId: ctx.profileId },
      ...(jobId ? { jobId } : {}),
    },
    include: { job: { include: { recruiter: true } } },
    orderBy: { matchScore: 'desc' },
  })
  if (!application) {
    return fail('Candidate not found among your applicants.', 404)
  }

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: { user: true, capabilityProfile: true, evidence: true },
  })
  if (!candidate) return fail('Candidate not found.', 404)

  return ok(serializeCandidateIntelligence(candidate, application))
}
