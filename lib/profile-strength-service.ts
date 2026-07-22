import { prisma } from '@/lib/prisma'
import { computeProfileStrength } from '@/lib/profile-strength'
import type { ProfileStrengthResult } from '@/lib/profile-strength'

/**
 * Recompute a candidate's profile strength from the current DB state and persist
 * it to `CandidateProfile.profileStrength`. Call after any profile mutation.
 */
export async function recalculateProfileStrength(
  profileId: string,
): Promise<ProfileStrengthResult | null> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    include: {
      _count: {
        select: {
          experiences: true,
          education: true,
          skills: true,
          evidence: true,
        },
      },
    },
  })
  if (!profile) return null

  const result = computeProfileStrength({
    profilePhoto: profile.profilePhoto,
    headline: profile.headline,
    bio: profile.bio,
    experienceCount: profile._count.experiences,
    educationCount: profile._count.education,
    skillCount: profile._count.skills,
    evidenceCount: profile._count.evidence,
  })

  await prisma.candidateProfile.update({
    where: { id: profileId },
    data: { profileStrength: result.strength },
  })

  return result
}
