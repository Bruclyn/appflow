'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Sparkles,
  Tag,
  Activity,
  Copy,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { GithubIcon } from '@/components/GithubIcon'
import { cn } from '@/lib/utils'
import { scoreLevel } from '@/lib/match'
import type { CandidateIntelligence } from '@/lib/recruiter-serializers'
import type { DetectedSkillItem } from '@/components/insights/types'
import type { InterviewQuestions } from '@/lib/interview-questions'

const STRENGTH_WIDTH: Record<string, string> = { strong: '100%', medium: '66%', emerging: '33%' }
const STRENGTH_COLOR: Record<string, string> = {
  strong: 'bg-success',
  medium: 'bg-warning',
  emerging: 'bg-slate-400',
}

export function CandidateProfile({ data }: { data: CandidateIntelligence }) {
  const router = useRouter()
  const toast = useToast()
  const match = data.match
  const cap = data.capability

  const [status, setStatus] = useState(match?.status ?? null)
  const [questions, setQuestions] = useState<InterviewQuestions | null>(null)
  const [generating, setGenerating] = useState(false)
  const [confirmingReject, setConfirmingReject] = useState(false)

  const backHref = match ? `/recruiter/jobs/${match.jobId}` : '/recruiter/candidates'

  async function setApplicationStatus(next: string) {
    if (!match) return
    try {
      await apiRequest('PATCH', `/api/recruiter/applications/${match.applicationId}/status`, {
        status: next,
      })
      setStatus(next)
      toast.success(`Moved to ${next}`)
      router.refresh()
    } catch (e) {
      toast.error('Could not update status', (e as Error).message)
    }
  }

  async function generateQuestions() {
    if (!match) return
    setGenerating(true)
    try {
      const result = await apiRequest<InterviewQuestions>(
        'POST',
        `/api/recruiter/candidates/${data.candidateId}/interview-questions`,
        { jobId: match.jobId },
      )
      setQuestions(result)
      toast.success('Interview questions generated')
    } catch (e) {
      toast.error('Could not generate questions', (e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text)
    toast.success('Copied to clipboard')
  }

  const skillGroups = groupSkills(cap?.detectedSkills ?? [])

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        {match ? 'Back to Job' : 'Back'}
      </Link>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">{data.name}</h1>
          <p className="mt-0.5 text-sm text-muted">{data.primaryRole ?? 'Not yet analyzed'}</p>
        </div>
        <div className="flex items-center gap-3">
          {match?.matchScore != null && (
            <span
              className={cn(
                'rounded-full px-4 py-2 font-display text-lg font-bold',
                scoreLevel(match.matchScore) === 'strong'
                  ? 'bg-success-light text-success'
                  : scoreLevel(match.matchScore) === 'medium'
                    ? 'bg-primary-light text-primary'
                    : 'bg-slate-100 text-slate-600',
              )}
            >
              {Math.round(match.matchScore)}% match
            </span>
          )}
          {match && status && (
            <select
              value={status}
              onChange={(e) => setApplicationStatus(e.target.value)}
              className="rounded-md border border-border px-2 py-2 text-sm font-medium focus:border-primary focus:outline-none"
            >
              {['APPLIED', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </header>

      {/* Overview */}
      <Card className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-primary-light text-2xl font-bold text-primary">
            {data.initials}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">{data.name}</p>
            <p className="text-sm text-muted">{data.primaryRole ?? 'Not yet analyzed'}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {data.location && <span className="text-xs text-slate-500">{data.location}</span>}
              {data.experienceLevel && <Badge variant="neutral">{data.experienceLevel}</Badge>}
            </div>
          </div>
        </div>
        {data.overallScore != null && (
          <div className="flex flex-none flex-col items-center gap-1">
            <ProgressRing value={data.overallScore} size={80} strokeWidth={8} indicatorClassName="text-secondary">
              <span className="font-display text-lg font-bold text-slate-900">{data.overallScore}%</span>
            </ProgressRing>
            <span className="text-xs text-muted">Capability Score</span>
          </div>
        )}
      </Card>

      {data.summary && (
        <Card className="p-6">
          <p className="text-sm leading-relaxed text-slate-600">{data.summary}</p>
        </Card>
      )}

      {/* Match analysis */}
      {match && (
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="font-display text-lg font-semibold text-slate-900">Match Analysis</h2>
            <span className="text-sm text-muted">
              for {match.jobTitle}{match.company ? ` at ${match.company}` : ''}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {match.matchScore != null ? (
              <span className="font-display text-4xl font-bold text-success">
                {Math.round(match.matchScore)}%
              </span>
            ) : (
              <span className="text-sm italic text-muted">Not yet analyzed for this role</span>
            )}
            {match.confidenceLevel && (
              <span className="text-sm text-slate-600">
                {match.confidenceLevel === 'high' ? 'High' : match.confidenceLevel === 'medium' ? 'Medium' : 'Low'}{' '}
                Confidence — based on {match.confidenceLevel === 'high' ? 'strong' : 'available'} evidence
              </span>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <MatchColumn icon={CheckCircle2} title="Strengths" tone="success" items={match.strengthAreas} empty="No standout strengths recorded." />
            <MatchColumn icon={AlertTriangle} title="Verify in interview" tone="warning" items={match.verifyAreas} empty="Nothing flagged to verify." />
            <MatchColumn icon={XCircle} title="Gaps" tone="danger" items={match.gaps} empty="No missing competencies recorded." />
          </div>
          {match.aiExplanation && (
            <p className="border-t border-border pt-3 text-sm text-slate-600">{match.aiExplanation}</p>
          )}
        </Card>
      )}

      {/* Evidence */}
      <Card className="space-y-3 p-6">
        <h2 className="font-display font-semibold text-slate-900">Evidence</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <GithubIcon className="mt-0.5 h-5 w-5 flex-none text-slate-700" />
            <div className="min-w-0">
              {data.evidence.github ? (
                <>
                  <a href={data.evidence.github.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                    @{data.evidence.github.username}
                  </a>
                  <p className="text-xs text-muted">
                    {data.evidence.github.repoCount} repositories · {data.evidence.github.languages.slice(0, 4).join(', ') || 'No languages'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">GitHub not connected</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-md border border-border p-4">
            <Globe className="mt-0.5 h-5 w-5 flex-none text-slate-700" />
            <div className="min-w-0">
              {data.evidence.portfolio ? (
                <a href={data.evidence.portfolio.url} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-semibold text-primary hover:underline">
                  {data.evidence.portfolio.url}
                </a>
              ) : (
                <p className="text-sm text-muted">Portfolio not connected</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Competency breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-secondary" />
          <h2 className="font-display font-semibold text-slate-900">Competency Breakdown</h2>
        </div>
        {skillGroups.length === 0 ? (
          <p className="mt-3 text-sm italic text-muted">No detected skills yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {skillGroups.map(([category, skills]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{category}</p>
                <div className="space-y-2">
                  {skills.map((s) => (
                    <div key={s.name} className="flex items-center gap-3" title={s.evidence}>
                      <span className="w-40 flex-none text-sm text-slate-700">{s.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full', STRENGTH_COLOR[s.evidenceStrength] ?? 'bg-slate-400')}
                          style={{ width: STRENGTH_WIDTH[s.evidenceStrength] ?? '33%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Interview support */}
      <Card ai className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="font-display font-semibold text-slate-900">Suggested Interview Questions</h2>
            <Badge variant="ai">AI-Generated</Badge>
          </div>
          {match && (
            <Button variant="ai" size="sm" isLoading={generating} onClick={generateQuestions}>
              {questions ? 'Regenerate' : 'Generate Questions'}
            </Button>
          )}
        </div>
        {!questions ? (
          <p className="mt-3 text-sm italic text-muted">
            {match ? 'Generate tailored questions based on this candidate’s evidence and the role.' : 'Open this candidate from a job to generate tailored questions.'}
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            <QuestionGroup title="Technical" items={questions.technical.map((q) => ({ text: q.question, meta: q.targetCompetency }))} onCopy={copy} />
            <QuestionGroup title="Behavioural" items={questions.behavioural.map((q) => ({ text: q.question, meta: q.rationale }))} onCopy={copy} />
            <QuestionGroup title="Verification" items={questions.verification.map((q) => ({ text: q.question, meta: q.whatToVerify }))} onCopy={copy} />
          </div>
        )}
      </Card>

      {/* Work patterns */}
      {cap?.workPatterns && (
        <Card ai className="p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            <h2 className="font-display font-semibold text-slate-900">Work Patterns</h2>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <PatternBox label="Consistency" value={cap.workPatterns.consistency} />
            <PatternBox label="Collaboration" value={cap.workPatterns.collaboration} />
            <PatternBox label="Documentation" value={cap.workPatterns.documentationQuality} />
          </div>
        </Card>
      )}

      {/* Actions */}
      {match && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setApplicationStatus('SHORTLISTED')}>Move to Shortlist</Button>
          <Button variant="ghost" onClick={() => setApplicationStatus('INTERVIEW')}>Schedule Interview</Button>
          <Button variant="ghost" onClick={() => toast.info('Talent pool coming soon')}>Add to Talent Pool</Button>
          {confirmingReject ? (
            <span className="flex items-center gap-2">
              <Button variant="danger" onClick={() => { setConfirmingReject(false); setApplicationStatus('REJECTED') }}>
                Confirm reject
              </Button>
              <Button variant="ghost" onClick={() => setConfirmingReject(false)}>Cancel</Button>
            </span>
          ) : (
            <Button variant="ghost" className="text-danger hover:bg-danger-light" onClick={() => setConfirmingReject(true)}>
              Reject
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function groupSkills(skills: DetectedSkillItem[]): [string, DetectedSkillItem[]][] {
  const groups = new Map<string, DetectedSkillItem[]>()
  for (const s of skills) {
    const key = s.category || 'Other'
    const list = groups.get(key) ?? []
    list.push(s)
    groups.set(key, list)
  }
  return [...groups.entries()]
}

function MatchColumn({
  icon: Icon,
  title,
  tone,
  items,
  empty,
}: {
  icon: typeof CheckCircle2
  title: string
  tone: 'success' | 'warning' | 'danger'
  items: string[]
  empty: string
}) {
  const toneColor = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-danger'
  return (
    <div className="rounded-md border border-border p-4">
      <div className={cn('flex items-center gap-1.5 text-sm font-semibold', toneColor)}>
        <Icon className="h-4 w-4" />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="mt-2 text-xs italic text-muted">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((it) => (
            <li key={it} className="text-sm text-slate-600">{it}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function QuestionGroup({
  title,
  items,
  onCopy,
}: {
  title: string
  items: { text: string; meta: string }[]
  onCopy: (text: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
      <ul className="space-y-2">
        {items.map((q, i) => (
          <li key={i} className="flex items-start gap-2 rounded-md border border-border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">{q.text}</p>
              {q.meta && <p className="mt-0.5 text-xs text-muted">{q.meta}</p>}
            </div>
            <button
              type="button"
              onClick={() => onCopy(q.text)}
              aria-label="Copy question"
              className="flex-none rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Copy className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PatternBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  )
}
