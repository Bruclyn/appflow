import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
}

/** AppFlow wordmark: "App" in slate-900, "Flow" in indigo, Plus Jakarta Sans 700. */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'font-display text-xl font-bold tracking-tight',
        className,
      )}
    >
      <span className="text-[#0F172A]">App</span>
      <span className="text-primary">Flow</span>
    </span>
  )
}
