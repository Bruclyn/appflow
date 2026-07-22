'use client'

import Link from 'next/link'
import { Check, Circle, Lightbulb } from 'lucide-react'
import { ProgressRing } from '@/components/ui/ProgressRing'
import type { ProfileStrengthItem } from '@/lib/profile-strength'

function ItemIcon({ complete }: { complete: boolean }) {
  return complete ? (
    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success-light">
      <Check className="h-3 w-3 text-success" />
    </span>
  ) : (
    <Circle className="h-5 w-5 flex-none text-slate-300" />
  )
}

export function CompletionSidebar({
  strength,
  items,
}: {
  strength: number
  items: ProfileStrengthItem[]
}) {
  function scrollTo(anchor: string) {
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const rowClass =
    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-slate-600 transition hover:bg-slate-50'

  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-6">
      <div className="rounded-xl border border-border bg-white p-6 shadow-card">
        <h2 className="font-display font-semibold text-slate-900">
          Profile Completion
        </h2>
        <div className="mt-4 flex justify-center">
          <ProgressRing value={strength} size={60} strokeWidth={6}>
            <span className="text-sm font-bold text-slate-900">{strength}%</span>
          </ProgressRing>
        </div>
        <ul className="mt-5 space-y-1">
          {items.map((item) => (
            <li key={item.key}>
              {item.key === 'evidence' ? (
                <Link href="/evidence" className={rowClass}>
                  <ItemIcon complete={item.complete} />
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => scrollTo(item.anchor)}
                  className={rowClass}
                >
                  <ItemIcon complete={item.complete} />
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-secondary/20 bg-secondary-light/40 p-4">
        <div className="flex gap-3">
          <Lightbulb className="h-5 w-5 flex-none text-secondary" />
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Tip:</span> Candidates with complete
            profiles get 3x more matches.
          </p>
        </div>
      </div>
    </aside>
  )
}
