'use client'

import { User, Check, Loader2 } from 'lucide-react'
import { CAREER_FIELDS } from '@/lib/career-fields'

export type BioStatus = 'idle' | 'saving' | 'saved'

const BIO_LIMIT = 500

export interface AboutCardProps {
  bio: string
  setBio: (v: string) => void
  bioStatus: BioStatus
  careerField: string
  onCareerFieldChange: (v: string) => void
}

export function AboutCard({
  bio,
  setBio,
  bioStatus,
  careerField,
  onCareerFieldChange,
}: AboutCardProps) {
  return (
    <section
      id="about"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">About</h2>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted">
          {bioStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </>
          )}
          {bioStatus === 'saved' && (
            <span className="flex items-center gap-1 text-success transition-opacity">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
        </span>
      </div>

      <div className="mt-4">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_LIMIT))}
          rows={4}
          placeholder="Write a short professional summary. What do you do, what are you passionate about, and what are you looking for?"
          className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="mt-1 text-right text-xs text-muted">
          {bio.length} / {BIO_LIMIT}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="career-field"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Career field
        </label>
        <select
          id="career-field"
          value={careerField}
          onChange={(e) => onCareerFieldChange(e.target.value)}
          className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="" disabled>
            Select your field
          </option>
          {CAREER_FIELDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
