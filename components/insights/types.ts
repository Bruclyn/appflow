export type StrengthLevel = 'strong' | 'good' | 'emerging'
export type Priority = 'high' | 'medium' | 'low'
export type EvidenceStrength = 'strong' | 'medium' | 'emerging'
export type FitLevel = 'Strong Fit' | 'Good Fit' | 'Potential Fit'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type ExperienceLevel = 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead'

export interface StrengthItem {
  area: string
  evidence: string
  level: StrengthLevel
}

export interface GrowthItem {
  area: string
  suggestion: string
  priority: Priority
}

export interface DetectedSkillItem {
  name: string
  category: string
  evidenceStrength: EvidenceStrength
  evidence: string
}

export interface PotentialRoleItem {
  title: string
  fitLevel: FitLevel
  reasoning: string
}

export interface WorkPatternsData {
  consistency: string
  collaboration: string
  documentationQuality: string
}

export interface CompetencyScores {
  technical: number
  problemSolving: number
  communication: number
  collaboration: number
}

/** The full analyzed capability profile, as rendered on the Insights page. */
export interface CapabilityInsight {
  primaryRole: string
  experienceLevel: string
  overallScore: number
  confidenceLevel: ConfidenceLevel
  summary: string
  strengths: StrengthItem[]
  growthAreas: GrowthItem[]
  detectedSkills: DetectedSkillItem[]
  potentialRoles: PotentialRoleItem[]
  workPatterns: WorkPatternsData
  competencies: CompetencyScores
  lastAnalyzedAt: string | null
}

/** Everything the Insights page needs, resolved server-side. */
export interface InsightsInitial {
  hasEvidence: boolean
  /** Non-null only when a full analysis has been generated. */
  insight: CapabilityInsight | null
}
