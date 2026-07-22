import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import type { ProfileInitial } from '@/components/profile/types'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
      skills: { orderBy: { createdAt: 'asc' } },
      _count: { select: { evidence: true } },
    },
  })
  if (!profile) redirect('/login')

  const initial: ProfileInitial = {
    name: session.user.name ?? '',
    headline: profile.headline ?? '',
    location: profile.location ?? '',
    careerField: profile.careerField ?? '',
    bio: profile.bio ?? '',
    profilePhoto: profile.profilePhoto,
    experiences: profile.experiences.map((e) => ({
      id: e.id,
      company: e.company,
      role: e.role,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      current: e.current,
      description: e.description,
    })),
    education: profile.education.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      field: e.field,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString() ?? null,
      current: e.current,
    })),
    skills: profile.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
    })),
    evidenceCount: profile._count.evidence,
  }

  return <ProfileEditor initial={initial} />
}
