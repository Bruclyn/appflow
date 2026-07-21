export interface ProfileStrengthItem {
  key: string
  label: string
  complete: boolean
  /** Section anchor id on the profile page (for click-to-scroll checklists). */
  anchor: string
}

export interface ProfileStrengthResult {
  strength: number
  items: ProfileStrengthItem[]
  completedCount: number
  totalCount: number
}

export interface ProfileStrengthInput {
  profilePhoto?: string | null
  headline?: string | null
  bio?: string | null
  experienceCount: number
  educationCount: number
  skillCount: number
  evidenceCount: number
}

/**
 * Single source of truth for profile completion. Used by the candidate layout,
 * the dashboard, and the /api/candidate/profile-strength route so the number is
 * always consistent.
 */
export function computeProfileStrength(
  input: ProfileStrengthInput,
): ProfileStrengthResult {
  const items: ProfileStrengthItem[] = [
    { key: 'photo', label: 'Profile photo', complete: Boolean(input.profilePhoto), anchor: 'header' },
    { key: 'headline', label: 'Headline added', complete: Boolean(input.headline?.trim()), anchor: 'header' },
    { key: 'bio', label: 'Bio written', complete: Boolean(input.bio?.trim()), anchor: 'about' },
    { key: 'experience', label: 'Experience added', complete: input.experienceCount > 0, anchor: 'experience' },
    { key: 'education', label: 'Education added', complete: input.educationCount > 0, anchor: 'education' },
    { key: 'skills', label: 'Skills added', complete: input.skillCount > 0, anchor: 'skills' },
    { key: 'evidence', label: 'Evidence connected', complete: input.evidenceCount > 0, anchor: 'evidence' },
  ]

  const completedCount = items.filter((i) => i.complete).length
  const strength = Math.round((completedCount / items.length) * 100)

  return { strength, items, completedCount, totalCount: items.length }
}
