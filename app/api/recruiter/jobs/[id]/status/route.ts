import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  getRecruiterContext,
  assertJobOwnership,
  ok,
  fail,
} from '@/lib/recruiter-api'

const schema = z.object({ isActive: z.boolean() })

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const owned = await assertJobOwnership(ctx.profileId, id)
  if (!owned.ok) return owned.response

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('isActive (boolean) is required')

  await prisma.job.update({ where: { id }, data: { isActive: parsed.data.isActive } })
  return ok({ id, isActive: parsed.data.isActive })
}
