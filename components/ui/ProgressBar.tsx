import { cn } from '@/lib/utils'

export type ProgressVariant = 'primary' | 'success' | 'ai'

export interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number
  variant?: ProgressVariant
  /** Show the numeric percentage on the right. */
  showLabel?: boolean
  /** Optional text label shown on the left. */
  label?: string
  className?: string
}

const fillStyles: Record<ProgressVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  ai: 'bg-secondary',
}

export function ProgressBar({
  value,
  variant = 'primary',
  showLabel = true,
  label,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
          <span>{label}</span>
          {showLabel && (
            <span className="tabular-nums text-slate-900">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            fillStyles[variant],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
