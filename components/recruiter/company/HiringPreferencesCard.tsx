'use client'

import { Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { JOB_TYPES, HIRING_SPEEDS } from '@/lib/recruiter-schemas'

export interface HiringPreferencesCardProps {
  jobTypes: string[]
  toggleJobType: (type: string) => void
  hiringSpeed: string
  setHiringSpeed: (v: string) => void
  teamSizeHiring: string
  setTeamSizeHiring: (v: string) => void
  dirty: boolean
  saving: boolean
  onSave: () => void
}

export function HiringPreferencesCard({
  jobTypes,
  toggleJobType,
  hiringSpeed,
  setHiringSpeed,
  teamSizeHiring,
  setTeamSizeHiring,
  dirty,
  saving,
  onSave,
}: HiringPreferencesCardProps) {
  return (
    <section className="rounded-xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">Hiring Preferences</h2>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Preferred job types</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {JOB_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={jobTypes.includes(type)}
                onChange={() => toggleJobType(type)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/30"
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hiring-speed" className="mb-1.5 block text-sm font-medium text-slate-700">
            Hiring speed
          </label>
          <select
            id="hiring-speed"
            value={hiringSpeed}
            onChange={(e) => setHiringSpeed(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Select hiring speed</option>
            {HIRING_SPEEDS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="team-size-hiring" className="mb-1.5 block text-sm font-medium text-slate-700">
            Team size hiring for
          </label>
          <input
            id="team-size-hiring"
            value={teamSizeHiring}
            onChange={(e) => setTeamSizeHiring(e.target.value)}
            placeholder="e.g. 3 engineers this quarter"
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
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
