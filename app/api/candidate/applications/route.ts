import { getCandidateContext, ok } from '@/lib/candidate-api'
import { buildApplicationsList } from '@/lib/candidate-jobs'

export async function GET() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const applications = await buildApplicationsList(ctx.profileId)
  return ok(applications)
}
