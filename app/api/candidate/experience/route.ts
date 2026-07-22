import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { experienceSchema } from '@/lib/candidate-schemas'

export async function POST(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = experienceSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { company, role, startDate, endDate, current, description } = parsed.data

  const experience = await prisma.experience.create({
    data: {
      candidateId: ctx.profileId,
      company,
      role,
      startDate,
      endDate: current ? null : (endDate ?? null),
      current,
      description: description ?? null,
    },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok(experience, 201)
}
