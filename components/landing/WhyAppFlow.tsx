import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const traditionalAts = [
  'Keyword matching only',
  'Misses strong candidates',
  'No evidence analysis',
  'Hours of manual screening',
]

const linkedin = [
  'Self-reported skills',
  'No verification',
  'Limited insight',
  'Expensive at scale',
]

const appflow = [
  'Real evidence analysis',
  'GitHub and portfolio insights',
  'AI capability profiling',
  'Ranked by actual fit',
]

function NegativeCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50 p-8">
      <h3 className="font-display text-lg font-semibold text-slate-500">
        {title}
      </h3>
      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-slate-500">
            <X className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WhyAppFlow() {
  return (
    <section className="bg-slate-50/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          A smarter way to evaluate talent
        </h2>

        <div className="mt-16 grid items-start gap-6 lg:grid-cols-3">
          <NegativeCard title="Traditional ATS" items={traditionalAts} />
          <NegativeCard title="LinkedIn Recruiting" items={linkedin} />

          {/* Highlighted AppFlow card */}
          <div
            className={cn(
              'relative rounded-xl border-2 border-primary bg-white p-8 shadow-elevated',
              'lg:-mt-4',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">
                AppFlow
              </h3>
              <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                Evidence-First
              </span>
            </div>
            <ul className="mt-6 space-y-3">
              {appflow.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm font-medium text-slate-800"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-none text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
