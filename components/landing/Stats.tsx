import { ShieldCheck, Sparkles, UserCheck, Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Stat {
  icon: LucideIcon
  title: string
  description: string
}

const stats: Stat[] = [
  {
    icon: ShieldCheck,
    title: 'Evidence-Based',
    description: 'Every score backed by real proof',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted',
    description: 'Claude AI analyzes candidate data',
  },
  {
    icon: UserCheck,
    title: 'Human Decisions',
    description: 'AI informs, humans always decide',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Candidate data protected always',
  },
]

export function Stats() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="text-center sm:text-left">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 text-white sm:mx-0">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-lg font-bold text-white">
                {stat.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-white/80">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
