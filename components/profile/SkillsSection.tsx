'use client'

import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Tag, X } from 'lucide-react'
import { suggestedSkillsFor } from '@/lib/career-fields'
import type { SkillDTO } from './types'

const MAX_SKILLS = 30

export interface SkillsSectionProps {
  skills: SkillDTO[]
  careerField: string
  onAdd: (name: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export function SkillsSection({
  skills,
  careerField,
  onAdd,
  onRemove,
}: SkillsSectionProps) {
  const [input, setInput] = useState('')

  const atLimit = skills.length >= MAX_SKILLS
  const existing = new Set(skills.map((s) => s.name.toLowerCase()))
  const suggestions = careerField
    ? suggestedSkillsFor(careerField).filter((s) => !existing.has(s.toLowerCase()))
    : []

  const groups = new Map<string, SkillDTO[]>()
  for (const s of skills) {
    const key = s.category?.trim() ? s.category : 'General'
    const arr = groups.get(key) ?? []
    arr.push(s)
    groups.set(key, arr)
  }

  function commit(value: string) {
    const name = value.replace(/,+$/, '').trim()
    if (name) onAdd(name)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(input)
    }
  }

  return (
    <section
      id="skills"
      className="scroll-mt-24 rounded-xl border border-border bg-white p-6 shadow-card"
    >
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-slate-900">Skills</h2>
        <span className="ml-auto text-xs text-muted">
          {skills.length}/{MAX_SKILLS}
        </span>
      </div>

      {skills.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No skills added yet.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {[...groups.entries()].map(([category, list]) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary"
                  >
                    {s.name}
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      aria-label={`Remove ${s.name}`}
                      className="text-primary/60 transition hover:text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={atLimit}
        placeholder={
          atLimit ? 'Skill limit reached' : 'Add a skill... press Enter to add'
        }
        className="mt-4 w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
      />

      {suggestions.length > 0 && !atLimit && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-muted">Suggested for {careerField}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onAdd(s)}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
