import { z } from 'zod'
import { ApplicationStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'

const schema = z.object({
  status: z.enum(
    Object.values(ApplicationStatus) as [ApplicationStatus, ...ApplicationStatus[]],
  ),
})

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail('A valid application status is required')

  // The recruiter may only update applications to jobs they own.
  const application = await prisma.application.findFirst({
    where: { id, job: { recruiterId: ctx.profileId } },
    select: { id: true },
  })
  if (!application) return fail('Application not found.', 404)

  await prisma.application.update({
    where: { id },
    data: { status: parsed.data.status },
  })

  return ok({ id, status: parsed.data.status })
}
