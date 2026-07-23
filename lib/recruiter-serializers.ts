import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { categorizeScore, initialsOf, strengthLabels } from '@/lib/match'
import type { JobFramework } from '@/lib/jd-analysis'
import { toCapabilityInsight } from '@/lib/insights-view'
import type { CapabilityInsight } from '@/components/insights/types'
import type { GitHubRepo, GitHubUser } from '@/lib/github'

type JobWithApplicants = Prisma.JobGetPayload<{
  include: {
    applications: {
      include: { candidate: { include: { user: true; capabilityProfile: true } } }
    }
  }
}>

export interface ApplicantRow {
  applicationId: string
  candidateId: string
  candidateName: string
  initials: string
  primaryRole: string | null
  matchScore: number | null
  confidenceLevel: string | null
  status: string
  strengthAreas: string[]
  appliedAt: string
}

export interface SerializedJob {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  isActive: boolean
  createdAt: string
  framework: JobFramework | null
  stats: { total: number; analyzed: number; strong: number; interviews: number }
  distribution: { highly: number; recommended: number; potential: number; low: number }
  applicants: ApplicantRow[]
}

function toFramework(value: Prisma.JsonValue | null): JobFramework | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const obj = value as Record<string, unknown>
  if (!Array.isArray(obj.competencies)) return null
  return obj as unknown as JobFramework
}

/** Serialize a job with its applicants into the recruiter job-dashboard model. */
export function serializeJobWithApplicants(job: JobWithApplicants): SerializedJob {
  const applicants: ApplicantRow[] = job.applications
    .map((app) => {
      const cap = app.candidate.capabilityProfile
      return {
        applicationId: app.id,
        candidateId: app.candidateId,
        candidateName: app.candidate.user.name ?? 'Candidate',
        initials: initialsOf(app.candidate.user.name ?? 'Candidate'),
        primaryRole: cap?.primaryRole ?? null,
        matchScore: app.matchScore,
        confidenceLevel: cap?.confidenceLevel ?? null,
        status: app.status,
        strengthAreas: strengthLabels(app.strengthAreas ?? cap?.strengths, 2),
        appliedAt: app.createdAt.toISOString(),
      }
    })
    .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))

  const distribution = { highly: 0, recommended: 0, potential: 0, low: 0 }
  for (const app of job.applications) {
    if (app.matchScore == null) continue
    distribution[categorizeScore(app.matchScore).bucket] += 1
  }

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isActive: job.isActive,
    createdAt: job.createdAt.toISOString(),
    framework: toFramework(job.competencyFramework),
    stats: {
      total: job.applications.length,
      analyzed: job.applications.filter((a) => a.matchScore != null).length,
      strong: job.applications.filter((a) => (a.matchScore ?? 0) >= 80).length,
      interviews: job.applications.filter((a) => a.status === 'INTERVIEW').length,
    },
    distribution,
    applicants,
  }
}

// --- job list --------------------------------------------------------------

export interface JobSummary {
  id: string
  title: string
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  isActive: boolean
  createdAt: string
  applicantCount: number
  strongMatchCount: number
}

/** List a recruiter's jobs with applicant + strong-match counts. */
export async function listRecruiterJobs(recruiterId: string): Promise<JobSummary[]> {
  const jobs = await prisma.job.findMany({
    where: { recruiterId },
    orderBy: { createdAt: 'desc' },
    include: { applications: { select: { matchScore: true } } },
  })

  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    isActive: job.isActive,
    createdAt: job.createdAt.toISOString(),
    applicantCount: job.applications.length,
    strongMatchCount: job.applications.filter((a) => (a.matchScore ?? 0) >= 80).length,
  }))
}

// --- candidate intelligence ------------------------------------------------

type CandidateFull = Prisma.CandidateProfileGetPayload<{
  include: { user: true; capabilityProfile: true; evidence: true }
}>

type ApplicationWithJob = Prisma.ApplicationGetPayload<{
  include: { job: { include: { recruiter: true } } }
}>

export interface GithubEvidenceSummary {
  username: string
  url: string
  repoCount: number
  languages: string[]
  topRepos: { name: string; description: string | null; language: string | null; stars: number }[]
}

export interface MatchAnalysisView {
  applicationId: string
  jobId: string
  jobTitle: string
  company: string | null
  matchScore: number | null
  confidenceLevel: string | null
  category: string
  strengthAreas: string[]
  verifyAreas: string[]
  gaps: string[]
  aiExplanation: string | null
  status: string
}

export interface CandidateIntelligence {
  candidateId: string
  name: string
  initials: string
  primaryRole: string | null
  experienceLevel: string | null
  location: string | null
  overallScore: number | null
  confidenceLevel: string | null
  summary: string | null
  capability: CapabilityInsight | null
  evidence: { github: GithubEvidenceSummary | null; portfolio: { url: string } | null }
  match: MatchAnalysisView | null
}

function githubSummary(evidence: CandidateFull['evidence']): GithubEvidenceSummary | null {
  const gh = evidence.find((e) => e.type === 'GITHUB')
  if (!gh?.rawData) return null
  const raw = gh.rawData as unknown as { profile?: GitHubUser; repos?: GitHubRepo[] }
  const repos = raw.repos ?? []
  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[]
  return {
    username: gh.username ?? raw.profile?.login ?? 'unknown',
    url: gh.url,
    repoCount: repos.length,
    languages,
    topRepos: [...repos]
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count ?? 0,
      })),
  }
}

/** Build the recruiter-facing candidate intelligence view. */
export function serializeCandidateIntelligence(
  candidate: CandidateFull,
  application: ApplicationWithJob | null,
): CandidateIntelligence {
  const cap = candidate.capabilityProfile
  const analyzed = !!cap && cap.overallScore != null
  const portfolio = candidate.evidence.find((e) => e.type === 'PORTFOLIO')

  const match: MatchAnalysisView | null = application
    ? {
        applicationId: application.id,
        jobId: application.jobId,
        jobTitle: application.job.title,
        company: application.job.recruiter.companyName ?? null,
        matchScore: application.matchScore,
        confidenceLevel: cap?.confidenceLevel ?? null,
        category: categorizeScore(application.matchScore).label,
        strengthAreas: strengthLabels(application.strengthAreas, 10),
        verifyAreas: strengthLabels(application.verifyAreas, 10),
        gaps: strengthLabels(application.alternativeRoles, 10),
        aiExplanation: application.aiExplanation,
        status: application.status,
      }
    : null

  return {
    candidateId: candidate.id,
    name: candidate.user.name ?? 'Candidate',
    initials: initialsOf(candidate.user.name ?? 'Candidate'),
    primaryRole: cap?.primaryRole ?? null,
    experienceLevel: cap?.experienceLevel ?? null,
    location: candidate.location,
    overallScore: cap?.overallScore ?? null,
    confidenceLevel: cap?.confidenceLevel ?? null,
    summary: cap?.summary ?? null,
    capability: analyzed && cap ? toCapabilityInsight(cap) : null,
    evidence: {
      github: githubSummary(candidate.evidence),
      portfolio: portfolio ? { url: portfolio.url } : null,
    },
    match,
  }
}

// --- dashboard -------------------------------------------------------------

export interface RecruiterDashboardData {
  stats: {
    activeJobs: number
    totalApplicants: number
    strongMatches: number
    pendingReview: number
  }
  recentJobs: {
    id: string
    title: string
    location: string | null
    jobType: string | null
    createdAt: string
    applicantCount: number
    strongMatchCount: number
  }[]
  topCandidates: {
    applicationId: string
    candidateId: string
    candidateName: string
    initials: string
    jobId: string
    jobTitle: string
    matchScore: number | null
    status: string
  }[]
}

/** Aggregate a recruiter's hiring activity for the dashboard. */
export async function buildRecruiterDashboard(
  recruiterId: string,
): Promise<RecruiterDashboardData> {
  const [jobs, topApps] = await Promise.all([
    prisma.job.findMany({
      where: { recruiterId },
      orderBy: { createdAt: 'desc' },
      include: { applications: { select: { matchScore: true, status: true } } },
    }),
    prisma.application.findMany({
      where: { job: { recruiterId }, matchScore: { not: null } },
      orderBy: { matchScore: 'desc' },
      take: 5,
      include: {
        candidate: { include: { user: { select: { name: true } } } },
        job: { select: { id: true, title: true } },
      },
    }),
  ])

  const allApps = jobs.flatMap((j) => j.applications)

  return {
    stats: {
      activeJobs: jobs.filter((j) => j.isActive).length,
      totalApplicants: allApps.length,
      strongMatches: allApps.filter((a) => (a.matchScore ?? 0) >= 80).length,
      pendingReview: allApps.filter((a) => a.status === 'APPLIED').length,
    },
    recentJobs: jobs
      .filter((j) => j.isActive)
      .slice(0, 3)
      .map((j) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        jobType: j.jobType,
        createdAt: j.createdAt.toISOString(),
        applicantCount: j.applications.length,
        strongMatchCount: j.applications.filter((a) => (a.matchScore ?? 0) >= 80).length,
      })),
    topCandidates: topApps.map((a) => ({
      applicationId: a.id,
      candidateId: a.candidateId,
      candidateName: a.candidate.user.name ?? 'Candidate',
      initials: initialsOf(a.candidate.user.name ?? 'Candidate'),
      jobId: a.job.id,
      jobTitle: a.job.title,
      matchScore: a.matchScore,
      status: a.status,
    })),
  }
}
