import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { runMatchingEngine } from '@/lib/matching-engine'

const schema = z.object({ jobId: z.string().min(1) })

export async function POST(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('A jobId is required')
  const { jobId } = parsed.data

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, isActive: true },
  })
  if (!job) return fail('Job not found.', 404)
  if (!job.isActive) return fail('This job is no longer accepting applications.', 400)

  const existing = await prisma.application.findUnique({
    where: { candidateId_jobId: { candidateId: ctx.profileId, jobId } },
    select: { id: true },
  })
  if (existing) return fail('You have already applied to this job.', 409)

  await prisma.application.create({
    data: { candidateId: ctx.profileId, jobId, status: 'APPLIED' },
  })

  // Run the matching engine immediately so the recruiter sees a score.
  let matchScore: number | null = null
  try {
    const result = await runMatchingEngine(ctx.profileId, jobId)
    matchScore = result.matchScore
  } catch (err) {
    console.error('[apply] matching failed', err)
  }

  return ok({ jobId, status: 'APPLIED', matchScore }, 201)
}
