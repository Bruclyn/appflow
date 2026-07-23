'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  Settings,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', href: '/recruiter/jobs', icon: Briefcase },
  { label: 'Candidates', href: '/recruiter/candidates', icon: Users },
  { label: 'Company Profile', href: '/recruiter/company', icon: Building2 },
  { label: 'Settings', href: '/recruiter/settings', icon: Settings },
]

const MOBILE_ITEMS = NAV_ITEMS.filter((i) => i.href !== '/recruiter/settings')

export interface RecruiterNavProps {
  name: string
  email: string
  companyName: string | null
  companyLogo: string | null
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/')
}

function initials(value: string) {
  return (
    value
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  )
}

export function RecruiterNav({
  name,
  email,
  companyName,
  companyLogo,
}: RecruiterNavProps) {
  const pathname = usePathname()
  const company = companyName?.trim() || 'Your Company'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] flex-col border-r border-border bg-white md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/recruiter/dashboard" aria-label="AppFlow home">
            <Logo />
          </Link>
        </div>

        {/* Company card */}
        <div className="mx-4 mb-2 flex items-center gap-3 rounded-lg border border-border bg-slate-50 p-3">
          {companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyLogo}
              alt=""
              className="h-10 w-10 flex-none rounded-md object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
              {initials(company)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {company}
            </p>
            <p className="text-xs text-slate-500">Recruiter</p>
          </div>
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
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    active ? 'text-primary' : 'text-slate-400',
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
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
              {initials(name)}
            </div>
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
