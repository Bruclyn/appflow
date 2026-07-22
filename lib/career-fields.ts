export const CAREER_FIELDS = [
  'Software Development',
  'Data Analytics',
  'UI/UX Design',
  'Product Management',
  'DevOps',
  'Cybersecurity',
  'Other',
] as const

export const DEGREES = [
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Certificate',
  'Diploma',
  'Other',
] as const

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const SUGGESTED_SKILLS: Record<string, string[]> = {
  'Software Development': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Go', 'SQL', 'Docker', 'Git'],
  'Data Analytics': ['Python', 'SQL', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'R', 'Excel', 'Statistics', 'Machine Learning'],
  'UI/UX Design': ['Figma', 'Sketch', 'Adobe XD', 'Prototyping', 'User Research', 'Wireframing', 'Design Systems', 'Accessibility', 'Usability Testing', 'Illustrator'],
  'Product Management': ['Roadmapping', 'Agile', 'Scrum', 'User Stories', 'Analytics', 'A/B Testing', 'Stakeholder Management', 'Jira', 'Figma', 'Market Research'],
  DevOps: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Ansible', 'Prometheus', 'Git', 'Bash'],
  Cybersecurity: ['Network Security', 'Penetration Testing', 'SIEM', 'Incident Response', 'Cryptography', 'Python', 'Linux', 'Firewalls', 'OWASP', 'Threat Analysis'],
  Other: ['Communication', 'Leadership', 'Project Management', 'Problem Solving', 'Teamwork', 'Time Management', 'Adaptability', 'Critical Thinking', 'Collaboration', 'Presentation'],
}

export function suggestedSkillsFor(field: string): string[] {
  return SUGGESTED_SKILLS[field] ?? SUGGESTED_SKILLS.Other
}

export function toMonthYear(iso: string | null): { month: number; year: number } | null {
  if (!iso) return null
  const d = new Date(iso)
  return { month: d.getMonth(), year: d.getFullYear() }
}

export function monthYearToISO(month: number, year: number): string {
  return new Date(year, month, 1).toISOString()
}

export function formatDateRange(
  startIso: string,
  endIso: string | null,
  current: boolean,
): string {
  const label = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  const start = label(new Date(startIso))
  const end = current || !endIso ? 'Present' : label(new Date(endIso))
  return `${start} — ${end}`
}
