import { prisma } from '@/lib/prisma'
import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import { skillSchema } from '@/lib/candidate-schemas'

const MAX_SKILLS = 30

export async function POST(req: Request) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const parsed = skillSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  const { name, category } = parsed.data

  const count = await prisma.candidateSkill.count({
    where: { candidateId: ctx.profileId },
  })
  if (count >= MAX_SKILLS) {
    return fail(`You can add up to ${MAX_SKILLS} skills.`, 400)
  }

  const duplicate = await prisma.candidateSkill.findFirst({
    where: {
      candidateId: ctx.profileId,
      name: { equals: name, mode: 'insensitive' },
    },
  })
  if (duplicate) {
    return fail('You already added that skill.', 409)
  }

  const skill = await prisma.candidateSkill.create({
    data: { candidateId: ctx.profileId, name, category: category ?? null },
  })

  await recalculateProfileStrength(ctx.profileId)
  return ok(skill, 201)
}
