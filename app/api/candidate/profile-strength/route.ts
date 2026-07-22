import { getCandidateContext, ok, fail } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'

export async function GET() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) return ctx.response

  const result = await recalculateProfileStrength(ctx.profileId)
  if (!result) return fail('Candidate profile not found', 404)

  return ok({
    score: result.strength,
    items: result.items.map((i) => ({
      key: i.key,
      complete: i.complete,
      label: i.label,
    })),
  })
}
