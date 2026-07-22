import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const existing = await prisma.candidateSkill.findUnique({ where: { id } })
  if (!existing || existing.candidateId !== ctx.profileId) {
    return fail('Skill not found', 404)
  }

  await prisma.candidateSkill.delete({ where: { id } })
  await recalculateProfileStrength(ctx.profileId)
  return ok({ id })
}
