import Anthropic from '@anthropic-ai/sdk'

export interface TechnicalQuestion {
  question: string
  rationale: string
  targetCompetency: string
}

export interface BehaviouralQuestion {
  question: string
  rationale: string
}

export interface VerificationQuestion {
  question: string
  whatToVerify: string
}

export interface InterviewQuestions {
  technical: TechnicalQuestion[]
  behavioural: BehaviouralQuestion[]
  verification: VerificationQuestion[]
}

/** The candidate context the generator references when writing questions. */
export interface InterviewCandidateProfile {
  name: string
  primaryRole: string | null
  experienceLevel: string | null
  summary: string | null
  detectedSkills: string[]
  strengthAreas: string[]
  topRepos: { name: string; description: string | null; language: string | null }[]
}

const SYSTEM_PROMPT = `You are AppFlow's interview design engine. Generate sharp, specific interview questions for a recruiter to ask a candidate, grounded in the candidate's actual projects, experience, and detected skills and in the competencies this job requires. Never write generic questions — every question must reference something concrete about this candidate or probe a specific competency. Return only valid JSON.`

const RESPONSE_SCHEMA = `{
  "technical": [
    { "question": "string", "rationale": "string", "targetCompetency": "string" }
  ],
  "behavioural": [
    { "question": "string", "rationale": "string" }
  ],
  "verification": [
    { "question": "string", "whatToVerify": "string" }
  ]
}`

export function buildInterviewQuestionsPrompt(
  candidate: InterviewCandidateProfile,
  jobCompetencies: string[],
): { system: string; user: string } {
  const user = [
    `Candidate: ${candidate.name}`,
    `Primary role: ${candidate.primaryRole ?? 'Unknown'}`,
    `Experience level: ${candidate.experienceLevel ?? 'Unknown'}`,
    candidate.summary ? `Summary: ${candidate.summary}` : '',
    `Detected skills: ${candidate.detectedSkills.join(', ') || 'None'}`,
    `Strength areas: ${candidate.strengthAreas.join(', ') || 'None'}`,
    'Notable repositories:',
    candidate.topRepos.length
      ? candidate.topRepos
          .map(
            (r) =>
              `- ${r.name}${r.language ? ` [${r.language}]` : ''}: ${r.description ?? 'No description'}`,
          )
          .join('\n')
      : '- None',
    '',
    `Job competencies to probe: ${jobCompetencies.join(', ') || 'General role competencies'}`,
    '',
    'Generate 3 technical, 2 behavioural, and 2 verification questions. Reference the candidate’s specific projects and experience.',
    'Return ONLY a JSON object matching this exact schema (no prose, no markdown fences):',
    RESPONSE_SCHEMA,
  ]
    .filter(Boolean)
    .join('\n')

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

export function parseInterviewQuestions(text: string): InterviewQuestions {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(extractJson(text)) as Record<string, unknown>
  } catch {
    throw new Error('Claude returned a response that could not be parsed as JSON.')
  }

  const technical = (Array.isArray(raw.technical) ? raw.technical : [])
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .filter((q) => typeof q.question === 'string')
    .map((q) => ({
      question: str(q.question),
      rationale: str(q.rationale),
      targetCompetency: str(q.targetCompetency),
    }))

  const behavioural = (Array.isArray(raw.behavioural) ? raw.behavioural : [])
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .filter((q) => typeof q.question === 'string')
    .map((q) => ({
      question: str(q.question),
      rationale: str(q.rationale),
    }))

  const verification = (Array.isArray(raw.verification) ? raw.verification : [])
    .filter((q): q is Record<string, unknown> => !!q && typeof q === 'object')
    .filter((q) => typeof q.question === 'string')
    .map((q) => ({
      question: str(q.question),
      whatToVerify: str(q.whatToVerify),
    }))

  return { technical, behavioural, verification }
}

/**
 * Generate interview questions for a candidate against a job's competencies.
 * Requires ANTHROPIC_API_KEY. Streams to avoid request timeouts.
 */
export async function generateInterviewQuestions(
  candidate: InterviewCandidateProfile,
  jobCompetencies: string[],
): Promise<InterviewQuestions> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not configured. Add it to your environment to run analysis.',
    )
  }

  const client = new Anthropic()
  const { system, user } = buildInterviewQuestionsPrompt(candidate, jobCompetencies)

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

  return parseInterviewQuestions(responseText)
}
