import type { RepoLite } from './types'

/** Well-known GitHub language colors (mirrors GitHub's linguist palette). */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#B07219',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#F34B7D',
  C: '#555555',
  'C#': '#178600',
  HTML: '#E34C26',
  CSS: '#563D7C',
  SCSS: '#C6538C',
  Shell: '#89E051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41B883',
  Svelte: '#FF3E00',
  Elixir: '#6E4A7E',
  Scala: '#C22D40',
  Lua: '#000080',
  'Jupyter Notebook': '#DA5B0B',
}

// Languages whose color is light enough that text on top should be dark.
const LIGHT_LANGUAGE_COLORS = new Set(['#F7DF1E', '#89E051', '#00B4AB'])

/** A stable, readable color for any language name. */
export function languageColor(name: string): string {
  const known = LANGUAGE_COLORS[name]
  if (known) return known
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360
  }
  return `hsl(${hash}, 60%, 52%)`
}

/** True when a language's dot/segment color needs dark foreground text. */
export function languageNeedsDarkText(name: string): boolean {
  return LIGHT_LANGUAGE_COLORS.has(LANGUAGE_COLORS[name] ?? '')
}

export interface LanguageSlice {
  name: string
  count: number
  percent: number
  color: string
}

/** Count primary languages across repos and turn them into percentage slices. */
export function computeLanguageBreakdown(repos: RepoLite[]): LanguageSlice[] {
  const counts = new Map<string, number>()
  for (const repo of repos) {
    if (!repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }
  const total = [...counts.values()].reduce((sum, n) => sum + n, 0)
  if (total === 0) return []

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: languageColor(name),
    }))
    .sort((a, b) => b.count - a.count)
}

/** The single most common language across repos, if any. */
export function topLanguage(repos: RepoLite[]): string | null {
  return computeLanguageBreakdown(repos)[0]?.name ?? null
}

/** Earliest repository creation year, used for "Active Since". */
export function earliestYear(repos: RepoLite[]): number | null {
  let earliest: number | null = null
  for (const repo of repos) {
    const year = new Date(repo.createdAt).getFullYear()
    if (Number.isNaN(year)) continue
    if (earliest === null || year < earliest) earliest = year
  }
  return earliest
}

/** Compact "3 days ago" style relative time. */
export function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'unknown'
  const diff = Math.max(0, Date.now() - then)
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}
