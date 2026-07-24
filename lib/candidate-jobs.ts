import { prisma } from '@/lib/prisma'
import {
  loadCandidateSignals,
  computeCoreMatch,
  previewMatchScore,
} from '@/lib/matching-engine'
import type { CoreMatch, CandidateSignals } from '@/lib/matching-engine'
import type { JobFramework, CompetencyImportance } from '@/lib/jd-analysis'

export interface CandidateJobCard {
  id: string
  title: string
  company: string
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  createdAt: string
  topCompetencies: string[]
  matchScore: number | null
  hasApplied: boolean
  applicationStatus: string | null
}

export interface JobCompetencyView {
  name: string
  importance: CompetencyImportance
  weight: number
}

export interface CandidateJobDetail {
  id: string
  title: string
  company: string
  description: string
  requirements: string | null
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  createdAt: string
  isActive: boolean
  competencies: JobCompetencyView[]
  match: CoreMatch | null
  hasApplied: boolean
  applicationStatus: string | null
}

export interface CandidateApplicationRow {
  applicationId: string
  jobId: string
  jobTitle: string
  company: string
  appliedAt: string
  matchScore: number | null
  status: string
}

function frameworkOf(value: unknown): JobFramework | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.competencies)) return null
  return obj as unknown as JobFramework
}

function topCompetencyNames(framework: JobFramework | null, limit = 3): string[] {
  if (!framework) return []
  return [...framework.competencies]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((c) => c.name)
}

/** Active jobs with the candidate's preview match score and applied state. */
export async function buildJobList(candidateId: string): Promise<CandidateJobCard[]> {
  const [signals, jobs, applications] = await Promise.all([
    loadCandidateSignals(candidateId),
    prisma.job.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: { recruiter: { select: { companyName: true } } },
    }),
    prisma.application.findMany({
      where: { candidateId },
      select: { jobId: true, status: true },
    }),
  ])

  const applied = new Map(applications.map((a) => [a.jobId, a.status]))
  const hasProfile = !!signals?.hasProfile

  const cards: CandidateJobCard[] = jobs.map((job) => {
    const framework = frameworkOf(job.competencyFramework)
    return {
      id: job.id,
      title: job.title,
      company: job.recruiter.companyName ?? 'A company',
      location: job.location,
      jobType: job.jobType,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      createdAt: job.createdAt.toISOString(),
      topCompetencies: topCompetencyNames(framework),
      matchScore: hasProfile && signals ? previewMatchScore(signals, framework) : null,
      hasApplied: applied.has(job.id),
      applicationStatus: applied.get(job.id) ?? null,
    }
  })

  // Best match first for profiled candidates, newest first otherwise.
  if (hasProfile) {
    cards.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))
  }
  return cards
}

/** Full job detail plus this candidate's match analysis and applied state. */
export async function buildJobDetail(
  candidateId: string,
  jobId: string,
): Promise<CandidateJobDetail | null> {
  const [signals, job, application] = await Promise.all([
    loadCandidateSignals(candidateId),
    prisma.job.findUnique({
      where: { id: jobId },
      include: { recruiter: { select: { companyName: true } } },
    }),
    prisma.application.findFirst({
      where: { candidateId, jobId },
      select: { status: true },
    }),
  ])
  if (!job) return null

  const framework = frameworkOf(job.competencyFramework)
  const match =
    signals?.hasProfile && signals ? computeCoreMatch(signals, framework) : null

  return {
    id: job.id,
    title: job.title,
    company: job.recruiter.companyName ?? 'A company',
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    createdAt: job.createdAt.toISOString(),
    isActive: job.isActive,
    competencies: (framework?.competencies ?? []).map((c) => ({
      name: c.name,
      importance: c.importance,
      weight: c.weight,
    })),
    match,
    hasApplied: !!application,
    applicationStatus: application?.status ?? null,
  }
}

/** All of a candidate's applications for the tracking page. */
export async function buildApplicationsList(
  candidateId: string,
): Promise<CandidateApplicationRow[]> {
  const applications = await prisma.application.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
    include: { job: { include: { recruiter: { select: { companyName: true } } } } },
  })

  return applications.map((a) => ({
    applicationId: a.id,
    jobId: a.jobId,
    jobTitle: a.job.title,
    company: a.job.recruiter.companyName ?? 'A company',
    appliedAt: a.createdAt.toISOString(),
    matchScore: a.matchScore,
    status: a.status,
  }))
}

export type { CoreMatch, CandidateSignals }
