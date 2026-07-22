import Anthropic from '@anthropic-ai/sdk'
import type {
  CapabilityInsight,
  CompetencyScores,
  ConfidenceLevel,
  DetectedSkillItem,
  GrowthItem,
  PotentialRoleItem,
  StrengthItem,
  WorkPatternsData,
} from '@/components/insights/types'

/** The analysis Claude returns (the persisted insight minus its timestamp). */
export type CandidateAnalysisResult = Omit<CapabilityInsight, 'lastAnalyzedAt'>

export interface AnalysisExperience {
  role: string
  company: string
  startDate: string
  endDate: string | null
  current: boolean
  description: string | null
}

export interface AnalysisEducation {
  institution: string
  degree: string
  field: string | null
}

export interface AnalysisRepo {
  name: string
  description: string | null
  language: string | null
  stars: number
}

export interface AnalysisGithub {
  username: string
  repoCount: number
  languages: string[]
  topRepos: AnalysisRepo[]
}

export interface CandidateAnalysisInput {
  name: string
  careerField: string | null
  headline: string | null
  bio: string | null
  experiences: AnalysisExperience[]
  education: AnalysisEducation[]
  skills: string[]
  github: AnalysisGithub | null
  portfolioUrl: string | null
  previouslyDetectedSkills: string[]
}

export const CANDIDATE_ANALYSIS_SYSTEM_PROMPT = `You are AppFlow's talent intelligence engine. Your job is to analyze a candidate's professional evidence and build an accurate, fair, and encouraging capability profile.

Focus on demonstrated ability — what they have actually built and done — not just what they claim. Be specific about evidence. Acknowledge what is strong, and frame gaps as growth opportunities rather than failures.

You must return only valid JSON matching the exact schema provided. Do not include any text outside the JSON object.`

const RESPONSE_SCHEMA = `{
  "primaryRole": "string",
  "experienceLevel": "Entry-level | Mid-level | Senior | Lead",
  "overallScore": 0-100,
  "confidenceLevel": "high | medium | low",
  "summary": "2-3 paragraph professional summary",
  "strengths": [
    {
      "area": "string",
      "evidence": "string describing specific proof",
      "level": "strong | good | emerging"
    }
  ],
  "growthAreas": [
    {
      "area": "string",
      "suggestion": "specific actionable suggestion",
      "priority": "high | medium | low"
    }
  ],
  "detectedSkills": [
    {
      "name": "string",
      "category": "string",
      "evidenceStrength": "strong | medium | emerging",
      "evidence": "string"
    }
  ],
  "potentialRoles": [
    {
      "title": "string",
      "fitLevel": "Strong Fit | Good Fit | Potential Fit",
      "reasoning": "string"
    }
  ],
  "workPatterns": {
    "consistency": "string",
    "collaboration": "string",
    "documentationQuality": "string"
  },
  "competencies": {
    "technical": 0-100,
    "problemSolving": 0-100,
    "communication": 0-100,
    "collaboration": 0-100
  }
}`

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().slice(0, 7)
}

function section(title: string, body: string): string {
  return `## ${title}\n${body}`
}

/**
 * Build the system + user prompt describing everything we know about a
 * candidate, and the exact JSON schema Claude must return.
 */
export function buildCandidateAnalysisPrompt(input: CandidateAnalysisInput): {
  system: string
  user: string
} {
  const parts: string[] = []

  parts.push(
    section(
      'Candidate',
      [
        `Name: ${input.name}`,
        `Career field: ${input.careerField ?? 'Not specified'}`,
        `Headline: ${input.headline ?? 'Not specified'}`,
        input.bio ? `Bio: ${input.bio}` : 'Bio: Not provided',
      ].join('\n'),
    ),
  )

  parts.push(
    section(
      'Professional experience',
      input.experiences.length === 0
        ? 'None listed.'
        : input.experiences
            .map((e) => {
              const end = e.current ? 'Present' : e.endDate ? formatDate(e.endDate) : 'Unknown'
              const desc = e.description ? `\n  ${e.description}` : ''
              return `- ${e.role} at ${e.company} (${formatDate(e.startDate)} – ${end})${desc}`
            })
            .join('\n'),
    ),
  )

  parts.push(
    section(
      'Education',
      input.education.length === 0
        ? 'None listed.'
        : input.education
            .map(
              (ed) =>
                `- ${ed.degree}${ed.field ? ` in ${ed.field}` : ''} — ${ed.institution}`,
            )
            .join('\n'),
    ),
  )

  parts.push(
    section(
      'Self-reported skills',
      input.skills.length === 0 ? 'None listed.' : input.skills.join(', '),
    ),
  )

  parts.push(
    section(
      'GitHub evidence',
      input.github
        ? [
            `Username: @${input.github.username}`,
            `Public repositories analyzed: ${input.github.repoCount}`,
            `Languages used: ${input.github.languages.join(', ') || 'Unknown'}`,
            'Top repositories:',
            ...input.github.topRepos.map(
              (r) =>
                `- ${r.name}${r.language ? ` [${r.language}]` : ''} (${r.stars} stars): ${
                  r.description ?? 'No description'
                }`,
            ),
          ].join('\n')
        : 'No GitHub account connected.',
    ),
  )

  parts.push(
    section(
      'Portfolio',
      input.portfolioUrl ? input.portfolioUrl : 'No portfolio connected.',
    ),
  )

  parts.push(
    section(
      'Previously detected skills (from GitHub analysis)',
      input.previouslyDetectedSkills.length === 0
        ? 'None.'
        : input.previouslyDetectedSkills.join(', '),
    ),
  )

  parts.push(
    [
      '---',
      'Analyze this candidate and return ONLY a JSON object matching this exact schema (no prose, no markdown fences):',
      RESPONSE_SCHEMA,
    ].join('\n'),
  )

  return {
    system: CANDIDATE_ANALYSIS_SYSTEM_PROMPT,
    user: parts.join('\n\n'),
  }
}

// --- parsing -------------------------------------------------------------

function extractJson(text: string): string {
  let candidate = text.trim()
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) candidate = fenced[1].trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    candidate = candidate.slice(start, end + 1)
  }
  return candidate
}

function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/**
 * Parse and normalize Claude's response into a well-formed result, so a
 * partially-shaped model response can never crash the UI.
 */
export function parseCandidateAnalysis(text: string): CandidateAnalysisResult {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(extractJson(text)) as Record<string, unknown>
  } catch {
    throw new Error('Claude returned a response that could not be parsed as JSON.')
  }

  const workPatterns = (raw.workPatterns ?? {}) as Partial<WorkPatternsData>
  const competencies = (raw.competencies ?? {}) as Partial<CompetencyScores>

  return {
    primaryRole: str(raw.primaryRole, 'Emerging Professional'),
    experienceLevel: str(raw.experienceLevel, 'Entry-level'),
    overallScore: clampScore(raw.overallScore),
    confidenceLevel: (['high', 'medium', 'low'] as const).includes(
      raw.confidenceLevel as ConfidenceLevel,
    )
      ? (raw.confidenceLevel as ConfidenceLevel)
      : 'low',
    summary: str(raw.summary),
    strengths: arr<StrengthItem>(raw.strengths)
      .filter((s) => s && typeof s.area === 'string')
      .map((s) => ({
        area: s.area,
        evidence: str(s.evidence),
        level: (['strong', 'good', 'emerging'] as const).includes(s.level)
          ? s.level
          : 'emerging',
      })),
    growthAreas: arr<GrowthItem>(raw.growthAreas)
      .filter((g) => g && typeof g.area === 'string')
      .map((g) => ({
        area: g.area,
        suggestion: str(g.suggestion),
        priority: (['high', 'medium', 'low'] as const).includes(g.priority)
          ? g.priority
          : 'medium',
      })),
    detectedSkills: arr<DetectedSkillItem>(raw.detectedSkills)
      .filter((s) => s && typeof s.name === 'string')
      .map((s) => ({
        name: s.name,
        category: str(s.category, 'Other'),
        evidenceStrength: (['strong', 'medium', 'emerging'] as const).includes(
          s.evidenceStrength,
        )
          ? s.evidenceStrength
          : 'emerging',
        evidence: str(s.evidence),
      })),
    potentialRoles: arr<PotentialRoleItem>(raw.potentialRoles)
      .filter((r) => r && typeof r.title === 'string')
      .map((r) => ({
        title: r.title,
        fitLevel: (['Strong Fit', 'Good Fit', 'Potential Fit'] as const).includes(
          r.fitLevel,
        )
          ? r.fitLevel
          : 'Potential Fit',
        reasoning: str(r.reasoning),
      })),
    workPatterns: {
      consistency: str(workPatterns.consistency, 'Not enough data'),
      collaboration: str(workPatterns.collaboration, 'Not enough data'),
      documentationQuality: str(
        workPatterns.documentationQuality,
        'Not enough data',
      ),
    },
    competencies: {
      technical: clampScore(competencies.technical),
      problemSolving: clampScore(competencies.problemSolving),
      communication: clampScore(competencies.communication),
      collaboration: clampScore(competencies.collaboration),
    },
  }
}

/**
 * Run the full candidate capability analysis with Claude.
 * Streams the response so long analyses don't hit a request timeout.
 */
export async function analyzeCandidate(
  input: CandidateAnalysisInput,
): Promise<CandidateAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. Add it to your environment to run analysis.',
    )
  }

  const client = new Anthropic()
  const { system, user } = buildCandidateAnalysisPrompt(input)

  const message = await client.messages
    .stream({
      model: 'claude-opus-4-8',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system,
      messages: [{ role: 'user', content: user }],
    })
    .finalMessage()

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return parseCandidateAnalysis(text)
}
