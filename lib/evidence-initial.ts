import { EvidenceType } from '@prisma/client'
import type { CapabilityProfile, Evidence } from '@prisma/client'
import type { GitHubRepo, GitHubUser } from '@/lib/github'
import type {
  CapabilityView,
  DetectedSkill,
  EvidenceInitial,
  GithubState,
  RepoLite,
} from '@/components/evidence/types'

function toRepoLite(repo: GitHubRepo): RepoLite {
  return {
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count ?? 0,
    updatedAt: repo.updated_at,
    createdAt: repo.created_at,
    fork: repo.fork,
  }
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function toCapabilityView(profile: CapabilityProfile | null): CapabilityView | null {
  if (!profile) return null
  const detectedSkills = Array.isArray(profile.competencies)
    ? (profile.competencies as unknown as DetectedSkill[])
    : []
  return {
    primaryRole: profile.primaryRole,
    // Not persisted on the profile — only available from a fresh analysis.
    experienceLevel: null,
    summary: profile.summary,
    detectedSkills,
    strengthAreas: asStringArray(profile.strengths),
    growthAreas: asStringArray(profile.growthAreas),
    potentialRoles: asStringArray(profile.potentialRoles),
    topLanguages: [],
    projectHighlights: [],
    workPatterns: null,
  }
}

/**
 * Shape raw Prisma rows into the serializable props the Evidence Center needs.
 * `githubConfigured` reflects whether GitHub OAuth env vars are present.
 */
export function buildEvidenceInitial(
  githubConfigured: boolean,
  evidence: Evidence[],
  capability: CapabilityProfile | null,
): EvidenceInitial {
  const githubEvidence = evidence.find((e) => e.type === EvidenceType.GITHUB)
  const portfolioEvidence = evidence.find((e) => e.type === EvidenceType.PORTFOLIO)

  let github: GithubState | null = null
  if (githubEvidence) {
    const raw = (githubEvidence.rawData ?? {}) as unknown as {
      profile?: GitHubUser
      repos?: GitHubRepo[]
    }
    const repos = (raw.repos ?? []).map(toRepoLite)
    github = {
      username: githubEvidence.username ?? raw.profile?.login ?? 'unknown',
      url: githubEvidence.url,
      analyzed: githubEvidence.analyzed,
      analyzedAt: githubEvidence.analyzedAt?.toISOString() ?? null,
      repos,
    }
  }

  const hasCapabilityData =
    !!capability &&
    (!!capability.primaryRole ||
      !!capability.summary ||
      (Array.isArray(capability.competencies) && capability.competencies.length > 0))

  return {
    githubConfigured,
    github,
    portfolioUrl: portfolioEvidence?.url ?? null,
    capability: hasCapabilityData ? toCapabilityView(capability) : null,
  }
}
