import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeProfileStrength } from '@/lib/profile-strength'
import { CandidateNav } from '@/components/layout/CandidateNav'

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'CANDIDATE') {
    redirect('/login')
  }

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
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

  const { strength } = computeProfileStrength({
    profilePhoto: profile?.profilePhoto,
    headline: profile?.headline,
    bio: profile?.bio,
    experienceCount: profile?._count.experiences ?? 0,
    educationCount: profile?._count.education ?? 0,
    skillCount: profile?._count.skills ?? 0,
    evidenceCount: profile?._count.evidence ?? 0,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <CandidateNav
        name={session.user.name ?? 'Candidate'}
        email={session.user.email ?? ''}
        profilePhoto={profile?.profilePhoto}
        profileStrength={strength}
      />
      <div className="md:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:pb-10">
          {children}
        </div>
      </div>
    </div>
  )
}
