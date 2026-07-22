import Anthropic from '@anthropic-ai/sdk'
import type { GitHubRepo } from './github'

export interface DetectedSkill {
  name: string
  evidence: string
  strength: string
}

export interface ProjectHighlight {
  name: string
  significance: string
}

export interface WorkPatterns {
  consistency: string
  collaboration: string
  documentationQuality: string
}

export interface GitHubAnalysisResult {
  primaryRole: string
  experienceLevel: string
  topLanguages: string[]
  detectedSkills: DetectedSkill[]
  projectHighlights: ProjectHighlight[]
  workPatterns: WorkPatterns
  summary: string
  strengthAreas: string[]
  growthAreas: string[]
  potentialRoles: string[]
}

const SYSTEM_PROMPT = `You are AppFlow's talent intelligence engine. Analyze a candidate's GitHub repositories and extract meaningful signals about their technical capabilities, experience level, and work patterns. Focus on demonstrated ability — what they have actually built — not just what languages appear. Be accurate, fair, and evidence-based. Return only valid JSON.`

// Shape shown to the model so it returns exactly the JSON structure we persist.
const RESPONSE_SHAPE = {
  primaryRole: 'Full-Stack Developer',
  experienceLevel: 'Mid-level',
  topLanguages: ['TypeScript', 'Python', 'SQL'],
  detectedSkills: [
    { name: 'React', evidence: 'Used in 5 repositories', strength: 'strong' },
  ],
  projectHighlights: [
    { name: 'repo-name', significance: 'Production-ready application with real users' },
  ],
  workPatterns: {
    consistency: 'Regular commits over 18 months',
    collaboration: '4 contributed repositories',
    documentationQuality: 'Good — most repos have READMEs',
  },
  summary: 'Two paragraph summary of this candidate’s demonstrated capabilities',
  strengthAreas: ['Backend Development', 'Database Design'],
  growthAreas: ['Testing', 'CI/CD'],
  potentialRoles: ['Backend Developer', 'Full-Stack Developer'],
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

/**
 * Analyze a candidate's GitHub repositories with Claude and return structured
 * talent signals. Requires ANTHROPIC_API_KEY.
 */
export async function analyzeGitHubEvidence(
  repositories: GitHubRepo[],
  username: string,
): Promise<GitHubAnalysisResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Add it to your environment to run analysis.')
  }

  const client = new Anthropic()

  // Compact, token-efficient view of the repositories.
  const repoData = repositories.slice(0, 50).map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    topics: r.topics,
    stars: r.stargazers_count,
    forks: r.forks_count,
    isFork: r.fork,
    archived: r.archived,
    updated: r.updated_at,
    created: r.created_at,
  }))

  const userMessage = [
    `GitHub user: @${username}`,
    `Repositories (${repoData.length}):`,
    JSON.stringify(repoData, null, 2),
    '',
    'Analyze these repositories and return ONLY a JSON object with exactly this structure (no prose, no markdown fences):',
    JSON.stringify(RESPONSE_SHAPE, null, 2),
  ].join('\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')

  try {
    return JSON.parse(extractJson(text)) as GitHubAnalysisResult
  } catch {
    throw new Error('Claude returned a response that could not be parsed as JSON.')
  }
}
