import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  getRecruiterContext,
  assertJobOwnership,
  ok,
  fail,
} from '@/lib/recruiter-api'
import { jobUpdateSchema } from '@/lib/job-schemas'
import { serializeJobWithApplicants } from '@/lib/recruiter-serializers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const job = await prisma.job.findFirst({
    where: { id, recruiterId: ctx.profileId },
    include: {
      applications: {
        include: {
          candidate: { include: { user: true, capabilityProfile: true } },
        },
      },
    },
  })
  if (!job) return fail('Job not found.', 404)

  return ok(serializeJobWithApplicants(job))
}

export async function PUT(req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const owned = await assertJobOwnership(ctx.profileId, id)
  if (!owned.ok) return owned.response

  const parsed = jobUpdateSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid job input')
  }
  const input = parsed.data

  const data: Prisma.JobUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.requirements !== undefined) data.requirements = input.requirements
  if (input.location !== undefined) data.location = input.location
  if (input.jobType !== undefined) data.jobType = input.jobType
  if (input.salaryMin !== undefined) data.salaryMin = input.salaryMin
  if (input.salaryMax !== undefined) data.salaryMax = input.salaryMax
  if (input.isActive !== undefined) data.isActive = input.isActive
  if (input.competencyFramework !== undefined) {
    data.competencyFramework = (input.competencyFramework ??
      Prisma.JsonNull) as Prisma.InputJsonValue
  }

  await prisma.job.update({ where: { id }, data })
  return ok({ id })
}

export async function DELETE(_req: Request, { params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const owned = await assertJobOwnership(ctx.profileId, id)
  if (!owned.ok) return owned.response

  // Applications cascade-delete with the job.
  await prisma.job.delete({ where: { id } })
  return ok({ success: true })
}
