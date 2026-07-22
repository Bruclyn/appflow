import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function EmptyState() {
  return (
    <Card className="flex flex-col items-center gap-5 px-6 py-14 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary-light text-secondary">
        <Sparkles className="h-16 w-16" aria-hidden="true" />
      </div>
      <div className="max-w-xl">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Connect your evidence first
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          AppFlow needs to analyze your GitHub repositories and portfolio before
          generating insights. The more evidence you provide, the more accurate
          your capability profile will be.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/evidence"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Connect GitHub
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Learn More
        </Link>
      </div>
    </Card>
  )
}
