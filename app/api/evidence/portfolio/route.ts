import { z } from 'zod'
import { EvidenceType } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'

const portfolioSchema = z.object({
  url: z.string().url('Enter a valid URL (including https://)').max(300),
})

export async function PUT(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = portfolioSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { url } = parsed.data
  const existing = await prisma.evidence.findFirst({
    where: { candidateId: ctx.profileId, type: EvidenceType.PORTFOLIO },
  })

  const evidence = existing
    ? await prisma.evidence.update({ where: { id: existing.id }, data: { url } })
    : await prisma.evidence.create({
        data: { candidateId: ctx.profileId, type: EvidenceType.PORTFOLIO, url },
      })

  await recalculateProfileStrength(ctx.profileId)
  return ok(evidence)
}

export async function DELETE() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  await prisma.evidence.deleteMany({
    where: { candidateId: ctx.profileId, type: EvidenceType.PORTFOLIO },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok({ success: true })
}
