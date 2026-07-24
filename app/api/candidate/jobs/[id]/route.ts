import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { buildJobDetail } from '@/lib/candidate-jobs'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response
  const { id } = await params

  const detail = await buildJobDetail(ctx.profileId, id)
  if (!detail) return fail('Job not found.', 404)

  return ok(detail)
}
