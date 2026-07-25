'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function AccountSettingsCard({
  name,
  email,
}: {
  name: string
  email: string
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold text-slate-900">Account Settings</h2>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Name</p>
            <p className="mt-1 text-sm text-slate-900">{name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Email</p>
            <p className="mt-1 text-sm text-slate-900">{email}</p>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted">More settings coming soon.</p>

        <Button
          variant="ghost"
          className="mt-4 border border-border"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </Card>
    </div>
  )
}
