import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildInsightsInitial } from '@/lib/insights-view'
import { InsightsClient } from '@/components/insights/InsightsClient'

export default async function InsightsPage() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) redirect('/login')

  const profile = await prisma.candidateProfile.findUnique({
    where: { id: ctx.profileId },
    include: {
      capabilityProfile: true,
      evidence: true,
      skills: true,
      experiences: true,
      education: true,
    },
  })
  if (!profile) redirect('/login')

  const initial = buildInsightsInitial(
    profile.capabilityProfile,
    profile.evidence.length,
  )

  return <InsightsClient initial={initial} />
}
