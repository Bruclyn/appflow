import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lift and deepen the shadow on hover. */
  hover?: boolean
  /** AI accent: a 3px violet left border. */
  ai?: boolean
}

export function Card({ className, hover = false, ai = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-card',
        hover && 'transition duration-200 hover:-translate-y-1 hover:shadow-elevated',
        ai && 'border-l-[3px] border-l-secondary',
        className,
      )}
      {...props}
    />
  )
}
