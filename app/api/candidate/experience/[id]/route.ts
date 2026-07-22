import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { experienceSchema } from '@/lib/candidate-schemas'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing || existing.candidateId !== ctx.profileId) {
    return fail('Experience not found', 404)
  }

  const parsed = experienceSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { company, role, startDate, endDate, current, description } = parsed.data

  const updated = await prisma.experience.update({
    where: { id },
    data: {
      company,
      role,
      startDate,
      endDate: current ? null : (endDate ?? null),
      current,
      description: description ?? null,
    },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const existing = await prisma.experience.findUnique({ where: { id } })
  if (!existing || existing.candidateId !== ctx.profileId) {
    return fail('Experience not found', 404)
  }

  await prisma.experience.delete({ where: { id } })
  await recalculateProfileStrength(ctx.profileId)
  return ok({ id })
}
