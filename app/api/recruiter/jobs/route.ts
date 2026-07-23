import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'
import { jobInputSchema } from '@/lib/job-schemas'

export async function GET() {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response

  const jobs = await prisma.job.findMany({
    where: { recruiterId: ctx.profileId },
    orderBy: { createdAt: 'desc' },
    include: { applications: { select: { matchScore: true, status: true } } },
  })

  const data = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isActive: job.isActive,
    createdAt: job.createdAt.toISOString(),
    applicantCount: job.applications.length,
    strongMatchCount: job.applications.filter((a) => (a.matchScore ?? 0) >= 80).length,
  }))

  return ok(data)
}

export async function POST(req: Request) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response

  const parsed = jobInputSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid job input')
  }
  const input = parsed.data

  const job = await prisma.job.create({
    data: {
      recruiterId: ctx.profileId,
      title: input.title,
      description: input.description,
      requirements: input.requirements ?? null,
      location: input.location ?? null,
      jobType: input.jobType ?? null,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      competencyFramework: (input.competencyFramework ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      isActive: input.isActive ?? true,
    },
    select: { id: true },
  })

  return ok({ id: job.id }, 201)
}
