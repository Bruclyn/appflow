import { z } from 'zod'
import { getRecruiterContext, ok, fail } from '@/lib/recruiter-api'
import { analyzeJobDescription } from '@/lib/jd-analysis'

const schema = z.object({
  title: z.string().max(150).optional().default(''),
  description: z.string().min(100, 'Description must be at least 100 characters').max(10000),
  requirements: z.string().max(5000).optional().nullable(),
})

export async function POST(req: Request) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) return ctx.response

  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? 'Invalid input')
  }

  try {
    const analysis = await analyzeJobDescription(
      parsed.data.title,
      parsed.data.description,
      parsed.data.requirements,
    )
    return ok(analysis)
  } catch (err) {
    console.error('[analyze-jd] error', err)
    return fail((err as Error).message || 'Analysis failed. Please try again.', 500)
  }
}
