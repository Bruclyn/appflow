import Anthropic from '@anthropic-ai/sdk'
import { Prisma, EvidenceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { CompetencyImportance, JobFramework } from '@/lib/jd-analysis'
import type { DetectedSkillItem } from '@/components/insights/types'

export interface MatchedCompetency {
  name: string
  candidateScore: number
  importance: CompetencyImportance
  weight: number
  evidenceNote: string
}

export type MatchCategory =
  | 'Highly Recommended'
  | 'Recommended'
  | 'Potential Match'
  | 'Low Alignment'

export interface MatchResult {
  matchScore: number
  confidenceScore: number
  matchCategory: MatchCategory
  strengthAreas: MatchedCompetency[]
  verifyAreas: MatchedCompetency[]
  gapAreas: MatchedCompetency[]
  alternativeRoles: string[]
  aiExplanation: string
}

// --- candidate signal extraction ------------------------------------------

export interface CandidateInput {
  detectedSkills: DetectedSkillItem[]
  selfReportedSkills: string[]
  experienceLevel: string | null
  potentialRoles: string[]
  hasGithub: boolean
  hasPortfolio: boolean
  overallScore: number | null
  hasProfile: boolean
}

export interface CandidateSignals {
  competencyScores: Map<string, { score: number; note: string }>
  experienceLevel: string | null
  potentialRoles: string[]
  hasGithub: boolean
  hasPortfolio: boolean
  overallScore: number | null
  hasProfile: boolean
}

const STRENGTH_BASE: Record<string, number> = { strong: 90, medium: 70, emerging: 50 }

/** Experience level multiplier applied to detected-skill scores. */
export function experienceMultiplier(level: string | null): number {
  const l = (level ?? '').toLowerCase()
  if (l.includes('lead')) return 1.1
  if (l.includes('senior')) return 1.0
  if (l.includes('mid')) return 0.85
  if (l.includes('entry') || l.includes('junior')) return 0.7
  return 0.85
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

/** Build the candidate competency score map from their profile signals. */
export function buildCandidateSignals(input: CandidateInput): CandidateSignals {
  const multiplier = experienceMultiplier(input.experienceLevel)
  const scores = new Map<string, { score: number; note: string }>()

  for (const skill of input.detectedSkills) {
    const base = STRENGTH_BASE[skill.evidenceStrength] ?? 50
    const key = normalize(skill.name)
    if (!key) continue
    scores.set(key, {
      score: clamp(base * multiplier),
      note: skill.evidence || `Detected from evidence (${skill.evidenceStrength})`,
    })
  }

  // Self-reported skills are lower-confidence and never overwrite evidence.
  for (const name of input.selfReportedSkills) {
    const key = normalize(name)
    if (!key || scores.has(key)) continue
    scores.set(key, { score: 40, note: 'Self-reported skill (no evidence yet)' })
  }

  return {
    competencyScores: scores,
    experienceLevel: input.experienceLevel,
    potentialRoles: input.potentialRoles,
    hasGithub: input.hasGithub,
    hasPortfolio: input.hasPortfolio,
    overallScore: input.overallScore,
    hasProfile: input.hasProfile,
  }
}

/** Fuzzy-match a competency name against the candidate's scored skills. */
function findCandidateScore(
  signals: CandidateSignals,
  competencyName: string,
): { score: number; note: string } | null {
  const target = normalize(competencyName)
  if (!target) return null
  const exact = signals.competencyScores.get(target)
  if (exact) return exact
  for (const [key, value] of signals.competencyScores) {
    if (key.length < 3 || target.length < 3) continue
    if (key.includes(target) || target.includes(key)) return value
  }
  return null
}

export function categorize(score: number): MatchCategory {
  if (score >= 90) return 'Highly Recommended'
  if (score >= 75) return 'Recommended'
  if (score >= 60) return 'Potential Match'
  return 'Low Alignment'
}

function confidence(
  signals: CandidateSignals,
  matchScore: number,
): number {
  if (signals.hasGithub && signals.hasPortfolio && matchScore > 70) return 90
  if (signals.hasGithub || signals.hasPortfolio || (matchScore >= 50 && matchScore <= 70)) {
    return 65
  }
  return 35
}

export type CoreMatch = Omit<MatchResult, 'aiExplanation' | 'alternativeRoles'>

/** Pure scoring — no DB, no AI. Safe to run for every job in a listing. */
export function computeCoreMatch(
  signals: CandidateSignals,
  framework: JobFramework | null,
): CoreMatch {
  const competencies = (framework?.competencies ?? []).filter((c) => c.name?.trim())

  if (competencies.length === 0) {
    const fallback = signals.overallScore ?? 0
    return {
      matchScore: fallback,
      confidenceScore: confidence(signals, fallback),
      matchCategory: categorize(fallback),
      strengthAreas: [],
      verifyAreas: [],
      gapAreas: [],
    }
  }

  const scored: MatchedCompetency[] = competencies.map((c) => {
    const match = findCandidateScore(signals, c.name)
    return {
      name: c.name,
      candidateScore: match ? match.score : 0,
      importance: c.importance,
      weight: c.weight,
      evidenceNote: match ? match.note : 'No evidence found for this competency',
    }
  })

  const totalWeight = scored.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0)
  const matchScore =
    totalWeight > 0
      ? clamp(scored.reduce((sum, c) => sum + c.candidateScore * Math.max(0, c.weight), 0) / totalWeight)
      : clamp(scored.reduce((sum, c) => sum + c.candidateScore, 0) / scored.length)

  return {
    matchScore,
    confidenceScore: confidence(signals, matchScore),
    matchCategory: categorize(matchScore),
    strengthAreas: scored.filter((c) => c.candidateScore >= 75),
    verifyAreas: scored.filter((c) => c.candidateScore >= 50 && c.candidateScore < 75),
    gapAreas: scored.filter((c) => c.candidateScore < 50),
  }
}

/** Just the score — used for job-listing previews. */
export function previewMatchScore(
  signals: CandidateSignals,
  framework: JobFramework | null,
): number {
  return computeCoreMatch(signals, framework).matchScore
}

// --- explanation -----------------------------------------------------------

export function buildFallbackExplanation(
  core: CoreMatch,
  jobTitle: string,
): string {
  const strengths = core.strengthAreas.slice(0, 2).map((c) => c.name)
  const gaps = core.gapAreas.slice(0, 2).map((c) => c.name)
  const parts = [`Candidate scored ${core.matchScore}% for the ${jobTitle} role.`]
  if (strengths.length) {
    parts.push(`Strong evidence in ${strengths.join(' and ')}.`)
  } else {
    parts.push('Limited direct evidence for the core competencies.')
  }
  if (gaps.length) {
    parts.push(`${gaps.join(' and ')} to verify or develop.`)
  } else if (core.verifyAreas.length) {
    parts.push(`${core.verifyAreas.slice(0, 2).map((c) => c.name).join(' and ')} worth confirming in interview.`)
  }
  return parts.join(' ')
}

/**
 * A short human-readable match explanation. Uses Claude Haiku when available
 * (kept intentionally lightweight), falling back to a deterministic summary.
 */
export async function generateMatchExplanation(
  core: CoreMatch,
  jobTitle: string,
): Promise<string> {
  const fallback = buildFallbackExplanation(core, jobTitle)
  if (!process.env.ANTHROPIC_API_KEY) return fallback

  try {
    const client = new Anthropic()
    const summary = {
      matchScore: core.matchScore,
      strengths: core.strengthAreas.map((c) => c.name),
      verify: core.verifyAreas.map((c) => c.name),
      gaps: core.gapAreas.map((c) => c.name),
    }
    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system:
        'You write a concise 2-3 sentence recruiter-facing explanation of a candidate-job match. Be specific and neutral. Return plain text only.',
      messages: [
        {
          role: 'user',
          content: `Job: ${jobTitle}\nMatch data: ${JSON.stringify(summary)}\nWrite the explanation.`,
        },
      ],
    })
    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join(' ')
      .trim()
    return text || fallback
  } catch {
    return fallback
  }
}

// --- orchestration ---------------------------------------------------------

/** Load a candidate's signals from the database. */
export async function loadCandidateSignals(candidateId: string): Promise<CandidateSignals | null> {
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    include: { capabilityProfile: true, evidence: true, skills: true },
  })
  if (!candidate) return null

  const cap = candidate.capabilityProfile
  const detectedSkills = Array.isArray(cap?.detectedSkills)
    ? (cap!.detectedSkills as unknown as DetectedSkillItem[])
    : []
  const potentialRoles = Array.isArray(cap?.potentialRoles)
    ? (cap!.potentialRoles as unknown as { title?: string }[])
        .map((r) => (typeof r === 'string' ? r : (r?.title ?? '')))
        .filter(Boolean)
    : []

  return buildCandidateSignals({
    detectedSkills,
    selfReportedSkills: candidate.skills.map((s) => s.name),
    experienceLevel: cap?.experienceLevel ?? null,
    potentialRoles,
    hasGithub: candidate.evidence.some((e) => e.type === EvidenceType.GITHUB),
    hasPortfolio: candidate.evidence.some((e) => e.type === EvidenceType.PORTFOLIO),
    overallScore: cap?.overallScore ?? null,
    hasProfile: !!cap,
  })
}

/** Detect up to 3 alternative roles that exist as other active jobs. */
async function detectAlternativeRoles(
  signals: CandidateSignals,
  excludeJobId: string,
): Promise<string[]> {
  if (signals.potentialRoles.length === 0) return []
  const activeJobs = await prisma.job.findMany({
    where: { isActive: true, id: { not: excludeJobId } },
    select: { title: true },
  })
  const titles = activeJobs.map((j) => j.title)
  const matched = new Set<string>()
  for (const role of signals.potentialRoles) {
    const roleNorm = normalize(role)
    if (!roleNorm) continue
    for (const title of titles) {
      const t = normalize(title)
      if (t.includes(roleNorm) || roleNorm.includes(t)) {
        matched.add(role)
        break
      }
    }
    if (matched.size >= 3) break
  }
  return [...matched].slice(0, 3)
}

/**
 * Run the full matching engine for a candidate against a job and persist the
 * result to the Application record. Returns the MatchResult.
 */
export async function runMatchingEngine(
  candidateId: string,
  jobId: string,
): Promise<MatchResult> {
  const [signals, job] = await Promise.all([
    loadCandidateSignals(candidateId),
    prisma.job.findUnique({ where: { id: jobId }, select: { title: true, competencyFramework: true } }),
  ])
  if (!signals) throw new Error('Candidate not found.')
  if (!job) throw new Error('Job not found.')

  const framework = (job.competencyFramework as unknown as JobFramework | null) ?? null
  const core = computeCoreMatch(signals, framework)

  const alternativeRoles =
    core.matchScore < 75 ? await detectAlternativeRoles(signals, jobId) : []
  const aiExplanation = await generateMatchExplanation(core, job.title)

  const result: MatchResult = { ...core, alternativeRoles, aiExplanation }

  await prisma.application.updateMany({
    where: { candidateId, jobId },
    data: {
      matchScore: result.matchScore,
      confidenceScore: result.confidenceScore,
      matchCategory: result.matchCategory,
      strengthAreas: result.strengthAreas as unknown as Prisma.InputJsonValue,
      verifyAreas: result.verifyAreas as unknown as Prisma.InputJsonValue,
      gapAreas: result.gapAreas as unknown as Prisma.InputJsonValue,
      alternativeRoles: result.alternativeRoles as unknown as Prisma.InputJsonValue,
      aiExplanation: result.aiExplanation,
      analyzedAt: new Date(),
    },
  })

  return result
}
