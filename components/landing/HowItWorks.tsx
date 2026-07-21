import {
  Target,
  Trophy,
  UserPlus,
  ClipboardList,
  ScanSearch,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { GithubIcon } from '@/components/GithubIcon'
import { cn } from '@/lib/utils'

interface Step {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}

const candidateSteps: Step[] = [
  {
    title: 'Build your profile',
    description: 'Add experience, education, and skills.',
    icon: UserPlus,
  },
  {
    title: 'Connect your evidence',
    description: 'Link GitHub and portfolio for AI analysis.',
    icon: GithubIcon,
  },
  {
    title: 'Get matched',
    description: 'Discover opportunities that match your actual ability.',
    icon: Target,
  },
]

const recruiterSteps: Step[] = [
  {
    title: 'Post your requirements',
    description: 'Define the role and competencies needed.',
    icon: ClipboardList,
  },
  {
    title: 'Receive analyzed applicants',
    description: "AI evaluates every candidate's real evidence.",
    icon: ScanSearch,
  },
  {
    title: 'Focus on top matches',
    description: 'Review ranked candidates with confidence scores.',
    icon: Trophy,
  },
]

function StepList({
  steps,
  accent,
}: {
  steps: Step[]
  accent: 'primary' | 'secondary'
}) {
  return (
    <ol className="mt-8 space-y-6">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <li key={step.title} className="flex gap-4">
            <div
              className={cn(
                'flex h-11 w-11 flex-none items-center justify-center rounded-full text-sm font-bold',
                accent === 'primary'
                  ? 'bg-primary-light text-primary'
                  : 'bg-secondary-light text-secondary',
              )}
            >
              {index + 1}
            </div>
            <div className="pt-0.5">
              <p className="flex items-center gap-2 font-display font-semibold text-slate-900">
                <Icon
                  className={cn(
                    'h-4 w-4',
                    accent === 'primary' ? 'text-primary' : 'text-secondary',
                  )}
                />
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {step.description}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          From evidence to opportunity
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
          Two sides of the same platform — built to reward what people can
          actually do.
        </p>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <div
            id="for-candidates"
            className="scroll-mt-24 rounded-xl border border-border bg-surface p-8 shadow-card"
          >
            <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
              For Candidates
            </span>
            <StepList steps={candidateSteps} accent="primary" />
          </div>

          <div
            id="for-recruiters"
            className="scroll-mt-24 rounded-xl border border-border bg-surface p-8 shadow-card"
          >
            <span className="inline-flex items-center rounded-full bg-secondary-light px-3 py-1 text-xs font-semibold text-secondary">
              For Recruiters
            </span>
            <StepList steps={recruiterSteps} accent="secondary" />
          </div>
        </div>
      </div>
    </section>
  )
}
