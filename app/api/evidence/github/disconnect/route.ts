import { EvidenceType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'

export async function DELETE() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  await prisma.evidence.deleteMany({
    where: { candidateId: ctx.profileId, type: EvidenceType.GITHUB },
  })

  // Clear GitHub-derived analysis from the capability profile.
  await prisma.capabilityProfile.updateMany({
    where: { candidateId: ctx.profileId },
    data: {
      primaryRole: null,
      summary: null,
      strengths: Prisma.DbNull,
      growthAreas: Prisma.DbNull,
      potentialRoles: Prisma.DbNull,
      competencies: Prisma.DbNull,
      lastAnalyzedAt: null,
    },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok({ success: true })
}
