'use client'

import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const DESCRIPTION_LIMIT = 500
const CULTURE_LIMIT = 300

export interface AboutCompanyCardProps {
  description: string
  setDescription: (v: string) => void
  whatWeLookFor: string
  setWhatWeLookFor: (v: string) => void
  dirty: boolean
  saving: boolean
  onSave: () => void
}

export function AboutCompanyCard({
  description,
  setDescription,
  whatWeLookFor,
  setWhatWeLookFor,
  dirty,
  saving,
  onSave,
}: AboutCompanyCardProps) {
  return (
    <section className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">About Company</h2>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Company description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_LIMIT))}
          rows={4}
          placeholder="What does your company do? What's your mission?"
          className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-1 text-right text-xs text-muted">
          {description.length} / {DESCRIPTION_LIMIT}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          What we look for
        </label>
        <textarea
          value={whatWeLookFor}
          onChange={(e) => setWhatWeLookFor(e.target.value.slice(0, CULTURE_LIMIT))}
          rows={3}
          placeholder="Describe your culture and the values you look for in candidates"
          className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-1 text-right text-xs text-muted">
          {whatWeLookFor.length} / {CULTURE_LIMIT}
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
