import { getCandidateContext, ok } from '@/lib/candidate-api'
import { buildJobList } from '@/lib/candidate-jobs'

export async function GET() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const jobs = await buildJobList(ctx.profileId)
  return ok(jobs)
}
