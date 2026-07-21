import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { GithubIcon } from '@/components/GithubIcon'

const microBadges = [
  'Free for candidates',
  'No keyword matching',
  'AI-powered insights',
]

const skills = [
  { name: 'Python', value: 95 },
  { name: 'API Development', value: 88 },
  { name: 'PostgreSQL', value: 82 },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/40 via-white to-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-28">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Evidence-Based Talent Intelligence
          </span>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
            Discover talent through{' '}
            <span className="text-primary">proof</span>, not promises.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            AppFlow analyzes real evidence — GitHub, portfolio, experience — to
            match candidates with opportunities based on what they can actually
            do.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-base font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
            >
              Find Opportunities
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-7 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {microBadges.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500"
              >
                <Check className="h-4 w-4 text-success" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right column — mock candidate intelligence card */}
        <div className="lg:pl-8">
          <MockCandidateCard />
        </div>
      </div>
    </section>
  )
}

function MockCandidateCard() {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-elevated">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
          SJ
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-slate-900">
            Sarah Johnson
          </p>
          <p className="text-sm text-slate-500">Backend Developer</p>
        </div>
        <Badge variant="success">91% Match</Badge>
      </div>

      {/* Evidence analyzed */}
      <div className="mt-6">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary">
          <Sparkles className="h-3.5 w-3.5" />
          Evidence Analyzed
        </p>
        <div className="mt-4 space-y-4">
          {skills.map((skill) => (
            <ProgressBar
              key={skill.name}
              label={skill.name}
              value={skill.value}
              variant="primary"
            />
          ))}
        </div>
      </div>

      {/* AI insight */}
      <div className="mt-6 rounded-md border-l-[3px] border-l-secondary bg-secondary-light/50 p-4">
        <p className="text-sm leading-6 text-slate-700">
          <span className="font-semibold text-secondary">AI insight:</span>{' '}
          Strong evidence across 7 GitHub repositories. Recommend for senior
          backend roles.
        </p>
      </div>

      {/* Footer badges */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success">
          <GithubIcon className="h-3.5 w-3.5" />
          GitHub Connected
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success">
          <span className="h-2 w-2 rounded-full bg-success" />
          Portfolio Verified
        </span>
      </div>
    </div>
  )
}
