import { z } from 'zod'
import { NextResponse } from 'next/server'
import { runMatchingEngine } from '@/lib/matching-engine'

const schema = z.object({ candidateId: z.string().min(1), jobId: z.string().min(1) })

// Internal route — intended to be called server-side. Runs the matching engine
// for a candidate/job pair and persists the result to the Application.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'candidateId and jobId are required' }, { status: 400 })
  }

  try {
    const result = await runMatchingEngine(parsed.data.candidateId, parsed.data.jobId)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Matching failed.' },
      { status: 500 },
    )
  }
}
