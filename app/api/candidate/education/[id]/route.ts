import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { educationSchema } from '@/lib/candidate-schemas'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const existing = await prisma.education.findUnique({ where: { id } })
  if (!existing || existing.candidateId !== ctx.profileId) {
    return fail('Education not found', 404)
  }

  const parsed = educationSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { institution, degree, field, startDate, endDate, current } = parsed.data

  const updated = await prisma.education.update({
    where: { id },
    data: {
      institution,
      degree,
      field: field ?? null,
      startDate,
      endDate: current ? null : (endDate ?? null),
      current,
    },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const existing = await prisma.education.findUnique({ where: { id } })
  if (!existing || existing.candidateId !== ctx.profileId) {
    return fail('Education not found', 404)
  }

  await prisma.education.delete({ where: { id } })
  await recalculateProfileStrength(ctx.profileId)
  return ok({ id })
}
