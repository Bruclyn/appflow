import type { CapabilityProfile } from '@prisma/client'
import type {
  CapabilityInsight,
  CompetencyScores,
  ConfidenceLevel,
  DetectedSkillItem,
  GrowthItem,
  InsightsInitial,
  PotentialRoleItem,
  StrengthItem,
  WorkPatternsData,
} from '@/components/insights/types'

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

const EMPTY_WORK_PATTERNS: WorkPatternsData = {
  consistency: 'Not enough data',
  collaboration: 'Not enough data',
  documentationQuality: 'Not enough data',
}

const EMPTY_COMPETENCIES: CompetencyScores = {
  technical: 0,
  problemSolving: 0,
  communication: 0,
  collaboration: 0,
}

/** Map a fully-analyzed CapabilityProfile row into the view model. */
export function toCapabilityInsight(
  profile: CapabilityProfile,
): CapabilityInsight {
  const workPatterns =
    profile.workPatterns && typeof profile.workPatterns === 'object'
      ? (profile.workPatterns as unknown as WorkPatternsData)
      : EMPTY_WORK_PATTERNS
  const competencies =
    profile.competencies && typeof profile.competencies === 'object' && !Array.isArray(profile.competencies)
      ? (profile.competencies as unknown as CompetencyScores)
      : EMPTY_COMPETENCIES

  return {
    primaryRole: profile.primaryRole ?? 'Emerging Professional',
    experienceLevel: profile.experienceLevel ?? 'Entry-level',
    overallScore: profile.overallScore ?? 0,
    confidenceLevel: (profile.confidenceLevel as ConfidenceLevel) ?? 'low',
    summary: profile.summary ?? '',
    strengths: asArray<StrengthItem>(profile.strengths),
    growthAreas: asArray<GrowthItem>(profile.growthAreas),
    detectedSkills: asArray<DetectedSkillItem>(profile.detectedSkills),
    potentialRoles: asArray<PotentialRoleItem>(profile.potentialRoles),
    workPatterns,
    competencies,
    lastAnalyzedAt: profile.lastAnalyzedAt?.toISOString() ?? null,
  }
}

/**
 * Build the Insights page props. A capability is only considered "analyzed"
 * for insights once a full analysis (with an overall score) has run.
 */
export function buildInsightsInitial(
  capability: CapabilityProfile | null,
  evidenceCount: number,
): InsightsInitial {
  const analyzed = !!capability && capability.overallScore != null
  return {
    hasEvidence: evidenceCount > 0,
    insight: analyzed && capability ? toCapabilityInsight(capability) : null,
  }
}
