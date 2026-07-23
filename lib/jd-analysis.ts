import Anthropic from '@anthropic-ai/sdk'

export type CompetencyImportance = 'Critical' | 'Important' | 'Nice to Have'

export interface JobCompetency {
  name: string
  importance: CompetencyImportance
  weight: number
  rationale: string
}

export interface JobDescriptionAnalysis {
  competencies: JobCompetency[]
  suggestedTitle: string
  experienceLevel: string
  keyResponsibilities: string[]
  niceToHave: string[]
}

/** The competency framework persisted on a Job (`Job.competencyFramework`). */
export interface JobFramework {
  competencies: JobCompetency[]
  experienceLevel?: string
  keyResponsibilities?: string[]
  niceToHave?: string[]
}

const MAX_COMPETENCIES = 8

const SYSTEM_PROMPT = `You are AppFlow's talent intelligence engine. Analyze a job description and extract the competencies that genuinely matter for success in the role, with an importance level and a weight reflecting how central each is. Be specific and evidence-based — anchor each competency in what the description actually asks for. Return only valid JSON.`

const RESPONSE_SCHEMA = `{
  "competencies": [
    {
      "name": "Python",
      "importance": "Critical | Important | Nice to Have",
      "weight": 25,
      "rationale": "Core language mentioned 4 times in JD"
    }
  ],
  "suggestedTitle": "Senior Backend Engineer",
  "experienceLevel": "Entry-level | Mid-level | Senior | Lead",
  "keyResponsibilities": ["string"],
  "niceToHave": ["string"]
}`

export function buildJdAnalysisPrompt(
  title: string,
  description: string,
  requirements?: string | null,
): { system: string; user: string } {
  const user = [
    `Job title: ${title || 'Not specified'}`,
    '',
    'Job description:',
    description,
    ...(requirements ? ['', 'Requirements:', requirements] : []),
    '',
    `Extract up to ${MAX_COMPETENCIES} competencies. The weights MUST sum to exactly 100.`,
    'Return ONLY a JSON object matching this exact schema (no prose, no markdown fences):',
    RESPONSE_SCHEMA,
  ].join('\n')

  return { system: SYSTEM_PROMPT, user }
}

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

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function strArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    : []
}

const IMPORTANCE: CompetencyImportance[] = ['Critical', 'Important', 'Nice to Have']

/** Rescale weights so they sum to exactly 100, correcting rounding on the last. */
function normalizeWeights(competencies: JobCompetency[]): JobCompetency[] {
  if (competencies.length === 0) return competencies
  const total = competencies.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0)
  const scaled = competencies.map((c) => ({
    ...c,
    weight: total > 0 ? Math.round((Math.max(0, c.weight) / total) * 100) : Math.round(100 / competencies.length),
  }))
  const scaledTotal = scaled.reduce((sum, c) => sum + c.weight, 0)
  const drift = 100 - scaledTotal
  if (drift !== 0) {
    scaled[scaled.length - 1].weight = Math.max(0, scaled[scaled.length - 1].weight + drift)
  }
  return scaled
}

export function parseJobDescriptionAnalysis(text: string): JobDescriptionAnalysis {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(extractJson(text)) as Record<string, unknown>
  } catch {
    throw new Error('Claude returned a response that could not be parsed as JSON.')
  }

  const competencies = (Array.isArray(raw.competencies) ? raw.competencies : [])
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .filter((c) => typeof c.name === 'string' && c.name.trim())
    .slice(0, MAX_COMPETENCIES)
    .map((c) => ({
      name: str(c.name),
      importance: IMPORTANCE.includes(c.importance as CompetencyImportance)
        ? (c.importance as CompetencyImportance)
        : 'Important',
      weight: typeof c.weight === 'number' ? c.weight : Number(c.weight) || 0,
      rationale: str(c.rationale),
    }))

  return {
    competencies: normalizeWeights(competencies),
    suggestedTitle: str(raw.suggestedTitle),
    experienceLevel: str(raw.experienceLevel, 'Mid-level'),
    keyResponsibilities: strArray(raw.keyResponsibilities),
    niceToHave: strArray(raw.niceToHave),
  }
}

/**
 * Analyze a job description with Claude and return a suggested competency
 * framework. Requires ANTHROPIC_API_KEY. Streams to avoid request timeouts.
 */
export async function analyzeJobDescription(
  title: string,
  description: string,
  requirements?: string | null,
): Promise<JobDescriptionAnalysis> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. Add it to your environment to run analysis.',
    )
  }

  const client = new Anthropic()
  const { system, user } = buildJdAnalysisPrompt(title, description, requirements)

  const message = await client.messages
    .stream({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      system,
      messages: [{ role: 'user', content: user }],
    })
    .finalMessage()

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  return parseJobDescriptionAnalysis(responseText)
}
