import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { educationSchema } from '@/lib/candidate-schemas'

export async function POST(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = educationSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { institution, degree, field, startDate, endDate, current } = parsed.data

  const education = await prisma.education.create({
    data: {
      candidateId: ctx.profileId,
      institution,
      degree,
      field: field ?? null,
      startDate,
      endDate: current ? null : (endDate ?? null),
      current,
    },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok(education, 201)
}
