'use client'

import { Users, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/ToastProvider'

function initials(name: string) {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export interface TeamMembersCardProps {
  name: string
  email: string
}

export function TeamMembersCard({ name, email }: TeamMembersCardProps) {
  const toast = useToast()

  return (
    <section className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-slate-900">Team Members</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info('Invite team members', 'Team invitations coming soon.')}
        >
          <UserPlus className="h-4 w-4" />
          Invite Team Members
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-md border border-border p-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <span className="flex-none rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          Owner
        </span>
      </div>
    </section>
  )
}
