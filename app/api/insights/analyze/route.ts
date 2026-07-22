import { EvidenceType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { analyzeCandidate } from '@/lib/candidate-analysis'
import type { CandidateAnalysisInput } from '@/lib/candidate-analysis'
import type { GitHubRepo, GitHubUser } from '@/lib/github'

/** Pull the skill names from whichever analysis previously wrote them. */
function previousSkillNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((s) => (typeof s === 'string' ? s : ((s as { name?: string })?.name ?? '')))
    .filter(Boolean)
}

export async function POST() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const profile = await prisma.candidateProfile.findUnique({
    where: { id: ctx.profileId },
    include: {
      user: { select: { name: true } },
      experiences: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
      skills: true,
      evidence: true,
      capabilityProfile: true,
    },
  })
  if (!profile) return fail('Candidate profile not found.', 404)

  if (profile.evidence.length === 0) {
    return fail('No evidence connected', 400)
  }

  // --- shape the GitHub evidence ---
  const githubEvidence = profile.evidence.find((e) => e.type === EvidenceType.GITHUB)
  let github: CandidateAnalysisInput['github'] = null
  if (githubEvidence?.rawData) {
    const raw = githubEvidence.rawData as unknown as {
      profile?: GitHubUser
      repos?: GitHubRepo[]
    }
    const repos = raw.repos ?? []
    const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[]
    github = {
      username: githubEvidence.username ?? raw.profile?.login ?? 'unknown',
      repoCount: repos.length,
      languages,
      topRepos: [...repos]
        .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
        .slice(0, 10)
        .map((r) => ({
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count ?? 0,
        })),
    }
  }

  const portfolio = profile.evidence.find((e) => e.type === EvidenceType.PORTFOLIO)

  const input: CandidateAnalysisInput = {
    name: profile.user.name ?? 'This candidate',
    careerField: profile.careerField,
    headline: profile.headline,
    bio: profile.bio,
    experiences: profile.experiences.map((e) => ({
      role: e.role,
      company: e.company,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      current: e.current,
      description: e.description,
    })),
    education: profile.education.map((ed) => ({
      institution: ed.institution,
      degree: ed.degree,
      field: ed.field,
    })),
    skills: profile.skills.map((s) => s.name),
    github,
    portfolioUrl: portfolio?.url ?? null,
    previouslyDetectedSkills: previousSkillNames(
      profile.capabilityProfile?.detectedSkills ??
        profile.capabilityProfile?.competencies,
    ),
  }

  try {
    const result = await analyzeCandidate(input)
    const analyzedAt = new Date()

    const data = {
      primaryRole: result.primaryRole,
      experienceLevel: result.experienceLevel,
      overallScore: result.overallScore,
      confidenceLevel: result.confidenceLevel,
      summary: result.summary,
      strengths: result.strengths as unknown as Prisma.InputJsonValue,
      growthAreas: result.growthAreas as unknown as Prisma.InputJsonValue,
      detectedSkills: result.detectedSkills as unknown as Prisma.InputJsonValue,
      potentialRoles: result.potentialRoles as unknown as Prisma.InputJsonValue,
      workPatterns: result.workPatterns as unknown as Prisma.InputJsonValue,
      competencies: result.competencies as unknown as Prisma.InputJsonValue,
      lastAnalyzedAt: analyzedAt,
    }

    await prisma.capabilityProfile.upsert({
      where: { candidateId: ctx.profileId },
      create: { candidateId: ctx.profileId, ...data },
      update: data,
    })

    // Every evidence record contributed to this analysis.
    await prisma.evidence.updateMany({
      where: { candidateId: ctx.profileId },
      data: { analyzed: true, analyzedAt },
    })

    await recalculateProfileStrength(ctx.profileId)

    return ok({ ...result, lastAnalyzedAt: analyzedAt.toISOString() })
  } catch (err) {
    console.error('[insights analyze] error', err)
    return fail((err as Error).message || 'Analysis failed. Please try again.', 500)
  }
}
