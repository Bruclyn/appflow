import { prisma } from '@/lib/prisma'
import {
  getRecruiterContext,
  assertJobOwnership,
  ok,
} from '@/lib/recruiter-api'
import { runMatchingEngine } from '@/lib/matching-engine'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const owned = await assertJobOwnership(ctx.profileId, id)
  if (!owned.ok) return owned.response

  const applications = await prisma.application.findMany({
    where: { jobId: id },
    select: { candidateId: true },
  })

  let updated = 0
  for (const app of applications) {
    try {
      await runMatchingEngine(app.candidateId, id)
      updated += 1
    } catch (err) {
      console.error('[match-all] failed for candidate', app.candidateId, err)
    }
  }

  return ok({ updated, total: applications.length })
}
