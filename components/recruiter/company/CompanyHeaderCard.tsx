'use client'

import { useRef } from 'react'
import { Camera, Loader2, Globe, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { INDUSTRIES, COMPANY_SIZES } from '@/lib/recruiter-schemas'

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

export interface CompanyHeaderCardProps {
  companyName: string
  setCompanyName: (v: string) => void
  industry: string
  setIndustry: (v: string) => void
  companySize: string
  setCompanySize: (v: string) => void
  website: string
  setWebsite: (v: string) => void
  location: string
  setLocation: (v: string) => void
  logo: string | null
  onUploadLogo: (file: File) => void
  uploading: boolean
  dirty: boolean
  saving: boolean
  onSave: () => void
}

export function CompanyHeaderCard({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  website,
  setWebsite,
  location,
  setLocation,
  logo,
  onUploadLogo,
  uploading,
  dirty,
  saving,
  onSave,
}: CompanyHeaderCardProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <section className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-none">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload company logo"
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-primary-light text-2xl font-bold text-primary"
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(companyName || 'Company')
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition group-hover:opacity-100">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onUploadLogo(file)
              e.target.value = ''
            }}
          />
        </div>

        <div className="flex-1 space-y-3">
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name"
            aria-label="Company name"
            className="w-full border-b border-transparent bg-transparent pb-1 font-display text-2xl font-semibold text-slate-900 placeholder:text-slate-300 focus:border-border focus:outline-none"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              aria-label="Industry"
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              aria-label="Company size"
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select company size</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s} value={s}>{s} employees</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL"
                aria-label="Website URL"
                className="w-full rounded-md border border-border bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                aria-label="Location"
                className="w-full rounded-md border border-border bg-white py-2.5 pl-9 pr-3.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="mt-4 flex justify-end">
          <Button onClick={onSave} isLoading={saving}>
            Save Changes
          </Button>
        </div>
      )}
    </section>
  )
}
