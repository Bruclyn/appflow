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

export type RecruiterContext =
  | { ok: true; userId: string; profileId: string }
  | { ok: false; response: NextResponse }

/**
 * Verify the caller is signed in as a RECRUITER and resolve their profile id.
 * Returns a ready-to-send error response otherwise.
 */
export async function getRecruiterContext(): Promise<RecruiterContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'RECRUITER') {
    return { ok: false, response: fail('You must be signed in as a recruiter.', 401) }
  }
  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!profile) {
    return { ok: false, response: fail('Recruiter profile not found.', 404) }
  }
  return { ok: true, userId: session.user.id, profileId: profile.id }
}

/**
 * Confirm a job belongs to this recruiter. Returns the job id on success or a
 * ready-to-send 404 so recruiters can never touch jobs they do not own.
 */
export async function assertJobOwnership(
  recruiterId: string,
  jobId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, recruiterId },
    select: { id: true },
  })
  if (!job) {
    return { ok: false, response: fail('Job not found.', 404) }
  }
  return { ok: true }
}
