import { redirect } from 'next/navigation'
import { FileText, Globe } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildEvidenceInitial } from '@/lib/evidence-initial'
import { GithubIcon } from '@/components/GithubIcon'
import { LinkedinIcon } from '@/components/LinkedinIcon'
import { Badge } from '@/components/ui/Badge'
import { SourceCard } from '@/components/evidence/SourceCard'
import { GitHubResults } from '@/components/evidence/GitHubResults'
import { PortfolioResults } from '@/components/evidence/PortfolioResults'

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
  const { github, portfolioUrl, githubConfigured } = initial

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Evidence Center
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect your work so AppFlow can understand what you can actually do
        </p>
      </header>

      {/* Info banner */}
      <div className="rounded-md border-l-[3px] border-l-secondary bg-secondary-light/50 px-4 py-3 text-sm text-slate-600">
        The more evidence you connect, the more accurately AppFlow can match you
        to relevant opportunities.
      </div>

      {/* Sources grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* GitHub */}
        <SourceCard
          icon={<GithubIcon className="h-6 w-6" />}
          title="GitHub"
          description="Analyze your repositories, languages, and project activity"
          badge={
            !githubConfigured ? (
              <Badge variant="neutral">Not Configured</Badge>
            ) : github ? (
              <Badge variant="success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Connected as @{github.username}
              </Badge>
            ) : undefined
          }
        >
          {!githubConfigured ? (
            <button
              type="button"
              disabled
              title="GitHub credentials not set up"
              className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
            >
              Connect GitHub
            </button>
          ) : github ? (
            <p className="text-sm text-slate-500">
              Connected. Manage analysis from the actions below.
            </p>
          ) : (
            <a
              href="/api/evidence/github/connect"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
            >
              Connect GitHub
            </a>
          )}
        </SourceCard>

        {/* Portfolio */}
        <SourceCard
          icon={<Globe className="h-6 w-6" />}
          title="Portfolio Website"
          description="Add your portfolio URL so AppFlow can reference your work"
        >
          {portfolioUrl ? (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-primary hover:underline"
            >
              {portfolioUrl}
            </a>
          ) : (
            <p className="text-sm text-slate-500">
              No portfolio added yet.
            </p>
          )}
        </SourceCard>

        {/* LinkedIn — coming soon */}
        <SourceCard
          icon={<LinkedinIcon className="h-6 w-6" />}
          title="LinkedIn"
          description="Import your professional history and endorsements"
          comingSoon
          badge={<Badge variant="warning">Coming Soon</Badge>}
        >
          <button
            type="button"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
          >
            Notify Me
          </button>
        </SourceCard>

        {/* Document upload — coming soon */}
        <SourceCard
          icon={<FileText className="h-6 w-6" />}
          title="Document Upload"
          description="Upload a resume or case study for AppFlow to analyze"
          comingSoon
          badge={<Badge variant="warning">Coming Soon</Badge>}
        >
          <button
            type="button"
            disabled
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
          >
            Notify Me
          </button>
        </SourceCard>
      </div>

      {/* GitHub results */}
      {github && github.analyzed && (
        <GitHubResults
          username={github.username}
          repos={github.repos}
          analyzedAt={github.analyzedAt}
          capability={initial.capability}
        />
      )}

      {/* Portfolio results */}
      {portfolioUrl && <PortfolioResults url={portfolioUrl} analyzed={false} />}
    </div>
  )
}
