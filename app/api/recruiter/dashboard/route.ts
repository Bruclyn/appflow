import { prisma } from '@/lib/prisma'
import { getRecruiterContext, ok } from '@/lib/recruiter-api'
import { buildRecruiterDashboard } from '@/lib/recruiter-serializers'

export async function GET() {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response

  const data = await buildRecruiterDashboard(ctx.profileId)
  return ok(data)
}
