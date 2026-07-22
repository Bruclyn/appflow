import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface SourceCardProps {
  icon: ReactNode
  title: string
  description: string
  /** Top-right badge (status / "Coming Soon"). */
  badge?: ReactNode
  /** Gray out and disable interaction (used for "coming soon" sources). */
  comingSoon?: boolean
  /** Action area rendered at the bottom of the card. */
  children?: ReactNode
}

/**
 * Presentational shell shared by every evidence source. The interactive body
 * (connect buttons, portfolio form, etc.) is supplied via `children`.
 */
export function SourceCard({
  icon,
  title,
  description,
  badge,
  comingSoon = false,
  children,
}: SourceCardProps) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col p-5',
        comingSoon && 'pointer-events-none select-none opacity-60',
      )}
      aria-disabled={comingSoon || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-700">
          {icon}
        </div>
        {badge}
      </div>

      <h3 className="mt-4 font-display text-base font-semibold text-slate-900">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>

      {children && <div className="mt-4 pt-1">{children}</div>}
    </Card>
  )
}
