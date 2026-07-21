import Link from 'next/link'
import { Logo } from '@/components/Logo'

const productLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'For Candidates', href: '#for-candidates' },
  { label: 'For Recruiters', href: '#for-recruiters' },
  { label: 'Get Started', href: '/register' },
]

const companyLinks = [
  { label: 'About', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
]

const contactLinks = [
  { label: 'hello@appflow.io', href: 'mailto:hello@appflow.io' },
  { label: 'Support', href: '#' },
  { label: 'Sign In', href: '/login' },
]

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-slate-500 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Evidence-based talent intelligence. Discover what candidates can
              actually do.
            </p>
          </div>
          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Contact" links={contactLinks} />
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-slate-400">
            AppFlow 2026. Built with evidence-based intelligence.
          </p>
        </div>
      </div>
    </footer>
  )
}
