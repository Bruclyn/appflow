import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildEvidenceInitial } from '@/lib/evidence-initial'
import { EvidenceCenter } from '@/components/evidence/EvidenceCenter'

export default async function EvidencePage() {
  const ctx = await getCandidateContext()
  if (!ctx.ok) redirect('/login')

  const [evidence, capability] = await Promise.all([
    prisma.evidence.findMany({ where: { candidateId: ctx.profileId } }),
    prisma.capabilityProfile.findUnique({ where: { candidateId: ctx.profileId } }),
  ])

  const initial = buildEvidenceInitial(
    !!process.env.GITHUB_CLIENT_ID,
    evidence,
    capability,
  )

  return <EvidenceCenter initial={initial} />
}
