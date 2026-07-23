import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  accent?: 'primary' | 'secondary' | 'success' | 'warning'
}

const ACCENT: Record<NonNullable<StatCardProps['accent']>, string> = {
  primary: 'bg-primary-light text-primary',
  secondary: 'bg-secondary-light text-secondary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
}

export function StatCard({ label, value, icon: Icon, accent = 'primary' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn('flex h-11 w-11 flex-none items-center justify-center rounded-md', ACCENT[accent])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-muted">{label}</p>
      </div>
    </Card>
  )
}
