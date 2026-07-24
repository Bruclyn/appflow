import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'
import { companySchema } from '@/lib/recruiter-schemas'

export async function PUT(req: Request) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response

  const parsed = companySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }
  const data = parsed.data

  const profile = await prisma.recruiterProfile.update({
    where: { id: ctx.profileId },
    data: {
      ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
      ...(data.companyLogo !== undefined ? { companyLogo: data.companyLogo } : {}),
      ...(data.industry !== undefined ? { industry: data.industry } : {}),
      ...(data.companySize !== undefined ? { companySize: data.companySize } : {}),
      ...(data.website !== undefined ? { website: data.website } : {}),
      ...(data.location !== undefined ? { location: data.location } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.whatWeLookFor !== undefined ? { whatWeLookFor: data.whatWeLookFor } : {}),
      ...(data.preferredJobTypes !== undefined
        ? { preferredJobTypes: data.preferredJobTypes }
        : {}),
      ...(data.hiringSpeed !== undefined ? { hiringSpeed: data.hiringSpeed } : {}),
      ...(data.teamSizeHiring !== undefined ? { teamSizeHiring: data.teamSizeHiring } : {}),
    },
  })

  return ok({ profile })
}
