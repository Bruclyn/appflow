import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'
import { generateInterviewQuestions } from '@/lib/interview-questions'
import type { InterviewCandidateProfile } from '@/lib/interview-questions'
import type { JobFramework } from '@/lib/jd-analysis'
import type { GitHubRepo } from '@/lib/github'

const schema = z.object({ jobId: z.string().min(1) })

type Params = { params: Promise<{ id: string }> }

function skillNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((s) => (typeof s === 'string' ? s : ((s as { name?: string })?.name ?? '')))
    .filter(Boolean)
}

export async function POST(req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('jobId is required')

  // Ownership: candidate applied to this recruiter's job.
  const application = await prisma.application.findFirst({
    where: {
      candidateId: id,
      jobId: parsed.data.jobId,
      job: { recruiterId: ctx.profileId },
    },
    include: { job: true },
  })
  if (!application) return fail('Application not found among your jobs.', 404)

  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: { user: true, capabilityProfile: true, evidence: true },
  })
  if (!candidate) return fail('Candidate not found.', 404)

  const cap = candidate.capabilityProfile
  const gh = candidate.evidence.find((e) => e.type === 'GITHUB')
  const repos = gh?.rawData
    ? ((gh.rawData as unknown as { repos?: GitHubRepo[] }).repos ?? [])
    : []

  const profile: InterviewCandidateProfile = {
    name: candidate.user.name ?? 'Candidate',
    primaryRole: cap?.primaryRole ?? null,
    experienceLevel: cap?.experienceLevel ?? null,
    summary: cap?.summary ?? null,
    detectedSkills: skillNames(cap?.detectedSkills),
    strengthAreas: skillNames(cap?.strengths),
    topRepos: [...repos]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 6)
      .map((r) => ({ name: r.name, description: r.description, language: r.language })),
  }

  const framework = application.job.competencyFramework as unknown as JobFramework | null
  const competencies = framework?.competencies?.map((c) => c.name) ?? []

  try {
    const questions = await generateInterviewQuestions(profile, competencies)
    return ok(questions)
  } catch (err) {
    console.error('[interview-questions] error', err)
    return fail((err as Error).message || 'Generation failed. Please try again.', 500)
  }
}
