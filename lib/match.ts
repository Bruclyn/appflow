export type MatchBucket = 'highly' | 'recommended' | 'potential' | 'low'

export interface MatchCategory {
  bucket: MatchBucket
  label: string
}

/** Distribution bucket for an analyzed match score. */
export function categorizeScore(score: number | null | undefined): MatchCategory {
  if (score == null) return { bucket: 'low', label: 'Not analyzed' }
  if (score >= 90) return { bucket: 'highly', label: 'Highly Recommended' }
  if (score >= 75) return { bucket: 'recommended', label: 'Recommended' }
  if (score >= 60) return { bucket: 'potential', label: 'Potential Match' }
  return { bucket: 'low', label: 'Low Alignment' }
}

/** Coarse score tier used to color badges (green / indigo / gray). */
export function scoreLevel(
  score: number | null | undefined,
): 'strong' | 'medium' | 'weak' {
  if (score != null && score >= 80) return 'strong'
  if (score != null && score >= 60) return 'medium'
  return 'weak'
}

export function initialsOf(value: string): string {
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

/** Pull display strings from a strengths JSON field of any historical shape. */
export function strengthLabels(value: unknown, limit = 2): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((s) => {
      if (typeof s === 'string') return s
      const obj = s as { area?: string; name?: string }
      return obj?.area ?? obj?.name ?? ''
    })
    .filter(Boolean)
    .slice(0, limit)
}
