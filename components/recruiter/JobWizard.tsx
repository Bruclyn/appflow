'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Sparkles, Trash2, Check } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { apiRequest } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import { JOB_TYPES } from '@/lib/job-schemas'
import type {
  CompetencyImportance,
  JobCompetency,
  JobDescriptionAnalysis,
} from '@/lib/jd-analysis'

const IMPORTANCE: CompetencyImportance[] = ['Critical', 'Important', 'Nice to Have']

export interface JobWizardInitial {
  title: string
  description: string
  requirements: string
  location: string
  jobType: string
  salaryMin: string
  salaryMax: string
  competencies: JobCompetency[]
  experienceLevel?: string
  keyResponsibilities?: string[]
  niceToHave?: string[]
}

interface JobWizardProps {
  mode: 'create' | 'edit'
  jobId?: string
  initial?: JobWizardInitial
}

const STEPS = ['Job Details', 'Competency Framework', 'Review & Post']

export function JobWizard({ mode, jobId, initial }: JobWizardProps) {
  const router = useRouter()
  const toast = useToast()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [requirements, setRequirements] = useState(initial?.requirements ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [jobType, setJobType] = useState(initial?.jobType ?? '')
  const [salaryMin, setSalaryMin] = useState(initial?.salaryMin ?? '')
  const [salaryMax, setSalaryMax] = useState(initial?.salaryMax ?? '')

  const [competencies, setCompetencies] = useState<JobCompetency[]>(
    initial?.competencies ?? [],
  )
  const [meta, setMeta] = useState<Partial<JobDescriptionAnalysis>>({
    experienceLevel: initial?.experienceLevel,
    keyResponsibilities: initial?.keyResponsibilities,
    niceToHave: initial?.niceToHave,
  })
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState((initial?.competencies?.length ?? 0) > 0)
  const [submitting, setSubmitting] = useState(false)

  const detailsValid = title.trim().length > 0 && description.trim().length >= 100
  const weightTotal = competencies.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)

  async function goToCompetencies() {
    if (!detailsValid) {
      toast.error('Add job details', 'A title and a description of 100+ characters are required.')
      return
    }
    setStep(2)
    if (!analyzed && competencies.length === 0) {
      await runAnalysis()
    }
  }

  async function runAnalysis() {
    setAnalyzing(true)
    try {
      const result = await apiRequest<JobDescriptionAnalysis>(
        'POST',
        '/api/recruiter/jobs/analyze-jd',
        { title, description, requirements: requirements || null },
      )
      setCompetencies(result.competencies)
      setMeta({
        experienceLevel: result.experienceLevel,
        keyResponsibilities: result.keyResponsibilities,
        niceToHave: result.niceToHave,
      })
      setAnalyzed(true)
      toast.success('Competencies suggested', 'Review and adjust the framework below.')
    } catch (e) {
      setAnalyzed(true)
      toast.error('Could not analyze the description', (e as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }

  function updateCompetency(index: number, patch: Partial<JobCompetency>) {
    setCompetencies((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }
  function addCompetency() {
    setCompetencies((prev) => [
      ...prev,
      { name: '', importance: 'Important', weight: 0, rationale: '' },
    ])
  }
  function removeCompetency(index: number) {
    setCompetencies((prev) => prev.filter((_, i) => i !== index))
  }

  async function submit(active: boolean) {
    setSubmitting(true)
    const payload = {
      title: title.trim(),
      description,
      requirements: requirements || null,
      location: location || null,
      jobType: jobType || null,
      salaryMin: salaryMin ? Number(salaryMin) : null,
      salaryMax: salaryMax ? Number(salaryMax) : null,
      isActive: active,
      competencyFramework: {
        competencies: competencies
          .filter((c) => c.name.trim())
          .map((c) => ({ ...c, weight: Number(c.weight) || 0 })),
        experienceLevel: meta.experienceLevel,
        keyResponsibilities: meta.keyResponsibilities,
        niceToHave: meta.niceToHave,
      },
    }
    try {
      const result = await apiRequest<{ id: string }>(
        mode === 'edit' ? 'PUT' : 'POST',
        mode === 'edit' ? `/api/recruiter/jobs/${jobId}` : '/api/recruiter/jobs',
        payload,
      )
      toast.success(mode === 'edit' ? 'Job updated' : active ? 'Job posted' : 'Draft saved')
      router.push(`/recruiter/jobs/${mode === 'edit' ? jobId : result.id}`)
      router.refresh()
    } catch (e) {
      toast.error('Could not save the job', (e as Error).message)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">
        {mode === 'edit' ? 'Edit Job' : 'Post a Job'}
      </h1>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = step > n
          const active = step === n
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold',
                  done
                    ? 'bg-success text-white'
                    : active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-500',
                )}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </div>
              <span className={cn('hidden text-sm font-medium sm:inline', active ? 'text-slate-900' : 'text-slate-500')}>
                {label}
              </span>
              {n < STEPS.length && <div className="h-px flex-1 bg-border" />}
            </div>
          )
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card className="space-y-4 p-6">
          <Input
            label="Job title"
            placeholder="Senior Backend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Job description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className={cn('mt-1 text-xs', description.trim().length >= 100 ? 'text-muted' : 'text-warning')}>
              {description.trim().length}/100 characters minimum
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Requirements <span className="text-muted">(optional)</span>
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Location" placeholder="Remote, London…" value={location} onChange={(e) => setLocation(e.target.value)} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Job type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="h-[42px] w-full rounded-md border border-border bg-white px-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a type</option>
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input label="Salary min" type="number" inputMode="numeric" placeholder="80000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            <Input label="Salary max" type="number" inputMode="numeric" placeholder="120000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={goToCompetencies} disabled={!detailsValid}>
              Next: Define Competencies
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card className="space-y-4 p-6">
          {analyzing ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              <p className="font-display font-semibold text-slate-900">
                AppFlow AI is analyzing your job description…
              </p>
              <p className="text-sm text-muted">Extracting the competencies that matter for this role.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <h2 className="font-display font-semibold text-slate-900">Competency Framework</h2>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    weightTotal === 100 ? 'bg-success-light text-success' : 'bg-warning-light text-warning',
                  )}
                >
                  Total weight: {weightTotal}%{weightTotal !== 100 ? ' (should be 100%)' : ''}
                </span>
              </div>

              {competencies.length === 0 && (
                <p className="text-sm italic text-muted">
                  No competencies yet. Add them manually or re-run the AI analysis.
                </p>
              )}

              <div className="space-y-3">
                {competencies.map((comp, i) => (
                  <div key={i} className="rounded-md border border-border p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={comp.name}
                        onChange={(e) => updateCompetency(i, { name: e.target.value })}
                        placeholder="Competency name"
                        className="min-w-[140px] flex-1 rounded-md border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <select
                        value={comp.importance}
                        onChange={(e) => updateCompetency(i, { importance: e.target.value as CompetencyImportance })}
                        className="rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                      >
                        {IMPORTANCE.map((imp) => (
                          <option key={imp} value={imp}>{imp}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={comp.weight}
                          onChange={(e) => updateCompetency(i, { weight: Number(e.target.value) })}
                          className="w-16 rounded-md border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                        />
                        <span className="text-sm text-muted">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCompetency(i)}
                        aria-label="Remove competency"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-danger hover:bg-danger-light"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {comp.rationale && (
                      <p className="mt-2 text-xs text-muted">{comp.rationale}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={addCompetency}>
                  <Plus className="h-4 w-4" />
                  Add Competency
                </Button>
                <Button variant="ghost" size="sm" onClick={runAnalysis}>
                  <Sparkles className="h-4 w-4" />
                  Re-run AI analysis
                </Button>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Previous</Button>
                <Button onClick={() => setStep(3)}>Next: Review &amp; Post</Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card className="space-y-5 p-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-slate-900">Job Details</h2>
              <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-primary hover:underline">
                Edit Details
              </button>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{title || 'Untitled role'}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {location && <Badge variant="neutral">{location}</Badge>}
              {jobType && <Badge variant="neutral">{jobType}</Badge>}
              {(salaryMin || salaryMax) && (
                <Badge variant="neutral">
                  {salaryMin ? `$${salaryMin}` : '—'} to {salaryMax ? `$${salaryMax}` : '—'}
                </Badge>
              )}
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-slate-500">{description}</p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-slate-900">Competency Framework</h2>
              <button type="button" onClick={() => setStep(2)} className="text-sm font-medium text-primary hover:underline">
                Edit Competencies
              </button>
            </div>
            <div className="mt-2 space-y-1.5">
              {competencies.filter((c) => c.name.trim()).length === 0 ? (
                <p className="text-sm italic text-muted">No competencies defined.</p>
              ) : (
                competencies
                  .filter((c) => c.name.trim())
                  .map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{c.name}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant={c.importance === 'Critical' ? 'danger' : c.importance === 'Important' ? 'ai' : 'neutral'}>
                          {c.importance}
                        </Badge>
                        <span className="w-10 text-right text-muted">{c.weight}%</span>
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => submit(false)} isLoading={submitting}>
              Save as Draft
            </Button>
            <Button onClick={() => submit(true)} isLoading={submitting}>
              {mode === 'edit' ? 'Save Changes' : 'Post Job'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
