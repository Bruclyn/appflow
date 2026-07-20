import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps {
  /** number → pixels, string → used as-is (e.g. "100%"). */
  width?: number | string
  height?: number | string
  className?: string
}

function toSize(value?: number | string): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

export function Skeleton({ width, height, className }: SkeletonProps) {
  const style: CSSProperties = {
    width: toSize(width),
    height: toSize(height),
  }

  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200', className)}
      style={style}
      aria-hidden="true"
    />
  )
}
