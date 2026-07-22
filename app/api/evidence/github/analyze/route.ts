import { EvidenceType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { analyzeGitHubEvidence } from '@/lib/github-analysis'
import type { GitHubRepo } from '@/lib/github'

export async function POST() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const evidence = await prisma.evidence.findFirst({
    where: { candidateId: ctx.profileId, type: EvidenceType.GITHUB },
  })
  if (!evidence?.rawData) {
    return fail('Connect your GitHub account before running analysis.', 400)
  }

  const raw = evidence.rawData as unknown as {
    profile?: { login?: string }
    repos?: GitHubRepo[]
  }
  const repos = raw.repos ?? []
  const username = raw.profile?.login ?? evidence.username ?? 'unknown'
  if (repos.length === 0) {
    return fail('No repositories were found to analyze.', 400)
  }

  try {
    const result = await analyzeGitHubEvidence(repos, username)

    const data = {
      primaryRole: result.primaryRole,
      summary: result.summary,
      strengths: result.strengthAreas as unknown as Prisma.InputJsonValue,
      growthAreas: result.growthAreas as unknown as Prisma.InputJsonValue,
      potentialRoles: result.potentialRoles as unknown as Prisma.InputJsonValue,
      competencies: result.detectedSkills as unknown as Prisma.InputJsonValue,
      lastAnalyzedAt: new Date(),
    }

    await prisma.capabilityProfile.upsert({
      where: { candidateId: ctx.profileId },
      create: { candidateId: ctx.profileId, ...data },
      update: data,
    })

    await prisma.evidence.update({
      where: { id: evidence.id },
      data: { analyzed: true, analyzedAt: new Date() },
    })

    return ok(result)
  } catch (err) {
    console.error('[github analyze] error', err)
    return fail((err as Error).message || 'Analysis failed. Please try again.', 500)
  }
}
