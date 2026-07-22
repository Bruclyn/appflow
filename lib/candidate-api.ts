import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status })
}

export type CandidateContext =
  | { ok: true; userId: string; profileId: string }
  | { ok: false; response: NextResponse }

/**
 * Verify the caller is signed in as a CANDIDATE and resolve their profile id.
 * Returns a ready-to-send error response otherwise.
 */
export async function getCandidateContext(): Promise<CandidateContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'CANDIDATE') {
    return { ok: false, response: fail('You must be signed in as a candidate.', 401) }
  }
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) {
    return { ok: false, response: fail('Candidate profile not found.', 404) }
  }
  return { ok: true, userId: session.user.id, profileId: profile.id }
}
