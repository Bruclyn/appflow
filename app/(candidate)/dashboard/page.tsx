import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { format } from 'date-fns'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeProfileStrength } from '@/lib/profile-strength'
import { buildJobList } from '@/lib/candidate-jobs'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { ProfileStrengthCard } from '@/components/dashboard/ProfileStrengthCard'
import { CareerSnapshot } from '@/components/dashboard/CareerSnapshot'
import { RecommendedJobs } from '@/components/dashboard/RecommendedJobs'
import type { JobMatch } from '@/components/dashboard/RecommendedJobs'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { ActivityItem } from '@/components/dashboard/RecentActivity'

const EVIDENCE_LABEL: Record<string, string> = {
  GITHUB: 'GitHub',
  PORTFOLIO: 'portfolio',
  LINKEDIN: 'LinkedIn',
  DOCUMENT: 'document',
}

/**
 * Strengths have been stored in a few shapes across sprints: plain strings,
 * `{ name }` from the GitHub-only analysis, and `{ area }` from the full
 * capability analysis. Accept all three.
 */
function normalizeStrengths(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const list = value
    .map((s) => {
      if (typeof s === 'string') return s
      const obj = s as { area?: string; name?: string }
      return obj?.area ?? obj?.name ?? ''
    })
    .filter(Boolean)
  return list.length > 0 ? list : null
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const firstName = (session.user.name ?? 'there').split(' ')[0]

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      capabilityProfile: true,
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

  const { strength, items } = computeProfileStrength({
    profilePhoto: profile?.profilePhoto,
    headline: profile?.headline,
    bio: profile?.bio,
    experienceCount: profile?._count.experiences ?? 0,
    educationCount: profile?._count.education ?? 0,
    skillCount: profile?._count.skills ?? 0,
    evidenceCount: profile?._count.evidence ?? 0,
    hasCapabilityProfile: !!profile?.capabilityProfile,
  })

  // --- Recommended jobs: real match scores from the matching engine ---
  let jobs: JobMatch[] = []
  const hasCapability =
    !!profile?.capabilityProfile && profile.capabilityProfile.overallScore != null
  if (profile && hasCapability) {
    const list = await buildJobList(profile.id)
    jobs = list.slice(0, 3).map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      matchScore: j.matchScore,
      reason: j.topCompetencies.slice(0, 2).join(' · ') || null,
    }))
  }

  // --- Recent activity synthesized from evidence + applications + profile edits ---
  const activities: ActivityItem[] = []
  if (profile) {
    const [evidence, applications] = await Promise.all([
      prisma.evidence.findMany({
        where: { candidateId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.application.findMany({
        where: { candidateId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { job: true },
      }),
    ])
    for (const e of evidence) {
      activities.push({
        id: `e-${e.id}`,
        kind: 'evidence',
        text: `Connected ${EVIDENCE_LABEL[e.type] ?? 'new'} evidence`,
        date: e.createdAt,
      })
    }
    for (const a of applications) {
      activities.push({
        id: `a-${a.id}`,
        kind: 'application',
        text: `Applied to ${a.job.title}`,
        date: a.createdAt,
      })
    }
    // Only surface a profile-update entry once the profile has actually been edited.
    if (profile.updatedAt.getTime() - profile.createdAt.getTime() > 1000) {
      activities.push({
        id: `p-${profile.id}`,
        kind: 'profile',
        text: 'Updated your profile',
        date: profile.updatedAt,
      })
    }
  }
  activities.sort((a, b) => b.date.getTime() - a.date.getTime())
  const recentActivities = activities.slice(0, 5)

  const cap = profile?.capabilityProfile ?? null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <span className="text-sm text-muted">
          {format(new Date(), 'EEEE, MMMM d')}
        </span>
      </div>

      {strength < 20 && <WelcomeBanner firstName={firstName} />}

      <ProfileStrengthCard strength={strength} items={items} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CareerSnapshot
          primaryRole={cap?.primaryRole ?? null}
          strengths={normalizeStrengths(cap?.strengths)}
          overallScore={cap?.overallScore ?? null}
          lastAnalyzedAt={cap?.lastAnalyzedAt ?? null}
        />
        <RecommendedJobs jobs={jobs} />
      </div>

      <RecentActivity items={recentActivities} />
    </div>
  )
}
