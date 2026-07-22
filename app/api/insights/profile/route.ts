import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok } from '@/lib/candidate-api'
import { toCapabilityInsight } from '@/lib/insights-view'

export async function GET() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const [capability, evidence] = await Promise.all([
    prisma.capabilityProfile.findUnique({ where: { candidateId: ctx.profileId } }),
    prisma.evidence.findMany({
      where: { candidateId: ctx.profileId },
      select: {
        id: true,
        type: true,
        url: true,
        username: true,
        analyzed: true,
        analyzedAt: true,
        createdAt: true,
      },
    }),
  ])

  const analyzed = !!capability && capability.overallScore != null

  return ok({
    profile: analyzed && capability ? toCapabilityInsight(capability) : null,
    evidence,
  })
}
