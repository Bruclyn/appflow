import type {
  DetectedSkill,
  ProjectHighlight,
  WorkPatterns,
} from '@/lib/github-analysis'

export type { DetectedSkill, ProjectHighlight, WorkPatterns }

/** A trimmed repository shape safe to serialize to the client. */
export interface RepoLite {
  name: string
  description: string | null
  htmlUrl: string
  language: string | null
  stars: number
  updatedAt: string
  createdAt: string
  fork: boolean
}

/** Connected-GitHub state passed from the server to the client orchestrator. */
export interface GithubState {
  username: string
  url: string
  analyzed: boolean
  analyzedAt: string | null
  repos: RepoLite[]
}

/**
 * A unified view of the AI capability assessment. The persisted
 * `CapabilityProfile` only stores a subset; the fuller fields
 * (experienceLevel, languages, highlights, patterns) are populated in-session
 * straight from a fresh analysis response.
 */
export interface CapabilityView {
  primaryRole: string | null
  experienceLevel: string | null
  summary: string | null
  detectedSkills: DetectedSkill[]
  strengthAreas: string[]
  growthAreas: string[]
  potentialRoles: string[]
  topLanguages: string[]
  projectHighlights: ProjectHighlight[]
  workPatterns: WorkPatterns | null
}

/** Everything the Evidence Center needs, resolved server-side. */
export interface EvidenceInitial {
  githubConfigured: boolean
  github: GithubState | null
  portfolioUrl: string | null
  capability: CapabilityView | null
}
