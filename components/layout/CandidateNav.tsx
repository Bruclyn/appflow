'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User,
  Link as LinkIcon,
  Sparkles,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  glow?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'Evidence Center', href: '/evidence', icon: LinkIcon },
  { label: 'AI Insights', href: '/insights', icon: Sparkles, glow: true },
  { label: 'Job Matches', href: '/jobs', icon: Briefcase },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const MOBILE_ITEMS: NavItem[] = NAV_ITEMS.filter((i) => i.href !== '/settings')

export interface CandidateNavProps {
  name: string
  email: string
  profilePhoto?: string | null
  profileStrength: number
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  )
}

export function CandidateNav({
  name,
  email,
  profilePhoto,
  profileStrength,
}: CandidateNavProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border bg-white md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/dashboard" aria-label="AppFlow home">
            <Logo />
          </Link>
        </div>

        {/* Profile completion mini-card */}
        <div className="mx-4 mb-2 rounded-lg border border-border bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ProgressRing value={profileStrength} size={48} strokeWidth={5}>
              <span className="text-xs font-bold text-slate-900">
                {profileStrength}%
              </span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="text-xs text-slate-500">Profile strength</p>
            </div>
          </div>
          {profileStrength < 80 && (
            <Link
              href="/profile"
              className="mt-3 block rounded-md bg-primary px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-primary-dark"
            >
              Complete your profile
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-primary-light text-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  item.glow && !active && 'shadow-ai',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    active
                      ? 'text-primary'
                      : item.glow
                        ? 'text-secondary'
                        : 'text-slate-400',
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            {profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePhoto}
                alt=""
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                {initials(name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="truncate text-xs text-slate-500">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-white md:hidden">
        {MOBILE_ITEMS.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                active ? 'text-primary' : 'text-slate-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label.split(' ')[0]}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
