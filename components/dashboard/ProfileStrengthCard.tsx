import Link from 'next/link'
import { Check, Circle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressRing'
import type { ProfileStrengthItem } from '@/lib/profile-strength'

function itemHref(item: ProfileStrengthItem) {
  return item.key === 'evidence' ? '/evidence' : `/profile#${item.anchor}`
}

export function ProfileStrengthCard({
  strength,
  items,
}: {
  strength: number
  items: ProfileStrengthItem[]
}) {
  const complete = strength === 100

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex flex-col items-center md:w-48 md:flex-none">
          <ProgressRing value={strength} size={80} strokeWidth={8}>
            <span className="text-lg font-bold text-slate-900">{strength}%</span>
          </ProgressRing>
          <p className="mt-3 text-sm font-medium text-muted">Profile Strength</p>
        </div>

        <div className="flex-1">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {items.map((item) => (
              <li key={item.key}>
                {item.complete ? (
                  <span className="flex items-center gap-2.5 text-sm text-slate-700">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-success-light">
                      <Check className="h-3 w-3 text-success" />
                    </span>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={itemHref(item)}
                    className="group flex items-center gap-2.5 text-sm text-slate-500 transition hover:text-primary"
                  >
                    <Circle className="h-5 w-5 flex-none text-slate-300 group-hover:text-primary" />
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-start md:justify-end">
            {complete ? (
              <Badge variant="success" className="px-3 py-1.5 text-sm">
                <Check className="h-4 w-4" />
                Profile Complete
              </Badge>
            ) : (
              <Link
                href="/profile"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Complete Your Profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
