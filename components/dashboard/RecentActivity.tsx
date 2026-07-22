import { Activity as ActivityIcon, ArrowUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export type ActivityKind = 'profile' | 'evidence' | 'application'

export interface ActivityItem {
  id: string
  kind: ActivityKind
  text: string
  date: Date
}

const dotColor: Record<ActivityKind, string> = {
  profile: 'bg-primary',
  evidence: 'bg-secondary',
  application: 'bg-success',
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <ActivityIcon className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">
          Recent Activity
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <ArrowUp className="h-4 w-4 text-muted" />
          No activity yet. Start by completing your profile.
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span
                className={cn(
                  'h-2.5 w-2.5 flex-none rounded-full',
                  dotColor[item.kind],
                )}
              />
              <span className="flex-1 text-sm text-slate-700">{item.text}</span>
              <span className="flex-none text-xs text-muted">
                {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
