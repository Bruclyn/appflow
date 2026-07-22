import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { profileSchema } from '@/lib/candidate-schemas'

export async function PUT(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = profileSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { name, headline, bio, location, careerField, profilePhoto } = parsed.data

  // Name lives on the User record.
  if (name !== undefined) {
    await prisma.user.update({ where: { id: ctx.userId }, data: { name } })
  }

  const profile = await prisma.candidateProfile.update({
    where: { id: ctx.profileId },
    data: {
      ...(headline !== undefined ? { headline } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(careerField !== undefined ? { careerField } : {}),
      ...(profilePhoto !== undefined ? { profilePhoto } : {}),
    },
  })

  const strength = await recalculateProfileStrength(ctx.profileId)

  return ok({ profile, name: name ?? undefined, strength: strength?.strength ?? null })
}
