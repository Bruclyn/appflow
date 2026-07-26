/**
 * Mock AI mode. When `MOCK_AI=true`, the analysis helpers return realistic,
 * hardcoded responses instead of calling the Claude API. This keeps the live
 * demo fully functional (and free) without an ANTHROPIC_API_KEY, while the exact
 * same code paths run against the real API when the flag is off.
 *
 * The mock data is deliberately specific — real skill names, evidence phrased
 * the way the model phrases it, weighted competencies that sum to 100 — so a
 * viewer cannot tell it apart from a genuine analysis.
 */
import type { CandidateAnalysisInput, CandidateAnalysisResult } from './candidate-analysis'
import type { GitHubAnalysisResult } from './github-analysis'
import type { JobDescriptionAnalysis, JobCompetency, CompetencyImportance } from './jd-analysis'
import type { InterviewCandidateProfile, InterviewQuestions } from './interview-questions'
import type { GitHubRepo } from './github'

export function isMockAi(): boolean {
  return process.env.MOCK_AI === 'true'
}

const DEFAULT_LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'SQL']

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'This candidate'
}

// --- candidate capability analysis ---------------------------------------

export function mockCandidateAnalysis(
  input: CandidateAnalysisInput,
): CandidateAnalysisResult {
  const languages = input.github?.languages?.length
    ? input.github.languages
    : DEFAULT_LANGUAGES
  const primaryLang = languages[0] ?? 'TypeScript'
  const who = firstName(input.name)
  const hasGithub = !!input.github

  return {
    primaryRole: 'Full-Stack Engineer',
    experienceLevel: 'Mid-level',
    overallScore: 82,
    confidenceLevel: hasGithub ? 'high' : 'medium',
    summary:
      `${who} is a capable full-stack engineer with demonstrated strength across the modern web stack, ` +
      `centred on ${primaryLang} and React. The evidence shows someone who ships complete, user-facing features — ` +
      `from data modelling through to polished UI — and who structures projects for maintainability rather than just to get them working.\n\n` +
      `The strongest signal is breadth backed by depth: several projects combine a typed frontend with a real API and persistence layer, ` +
      `which points to genuine end-to-end ownership. The clearest growth path is toward the practices that separate mid-level from senior — ` +
      `automated testing, CI/CD, and system design at scale — all of which are natural next steps rather than fundamental gaps.`,
    strengths: [
      {
        area: 'Frontend Engineering',
        evidence: `Multiple React + ${primaryLang} projects with component-driven architecture and thoughtful state management.`,
        level: 'strong',
      },
      {
        area: 'API & Backend Development',
        evidence: 'Built REST endpoints with input validation, auth, and a relational data layer across several repositories.',
        level: 'strong',
      },
      {
        area: 'Data Modelling',
        evidence: 'Normalized schemas and considered relationships in projects using PostgreSQL and an ORM.',
        level: 'good',
      },
      {
        area: 'Product Sense',
        evidence: 'Projects target real user flows end-to-end rather than isolated technical demos.',
        level: 'good',
      },
    ],
    growthAreas: [
      {
        area: 'Automated Testing',
        suggestion: 'Add unit and integration tests to a flagship project — start with the critical business logic and API routes.',
        priority: 'high',
      },
      {
        area: 'CI/CD',
        suggestion: 'Introduce a GitHub Actions pipeline that runs lint, typecheck, and tests on every pull request.',
        priority: 'medium',
      },
      {
        area: 'System Design',
        suggestion: 'Document the architecture of one project — data flow, trade-offs, and scaling considerations — to practise reasoning about systems.',
        priority: 'medium',
      },
    ],
    detectedSkills: [
      { name: 'React', category: 'Frontend', evidenceStrength: 'strong', evidence: 'Primary framework across the majority of recent projects.' },
      { name: primaryLang, category: 'Languages', evidenceStrength: 'strong', evidence: `Main language by volume; used idiomatically with strong typing.` },
      { name: 'Node.js', category: 'Backend', evidenceStrength: 'strong', evidence: 'Server-side APIs and tooling in several repositories.' },
      { name: 'Next.js', category: 'Frontend', evidenceStrength: 'medium', evidence: 'App Router projects with server components and API routes.' },
      { name: 'PostgreSQL', category: 'Databases', evidenceStrength: 'medium', evidence: 'Relational schemas accessed through an ORM.' },
      { name: 'Tailwind CSS', category: 'Frontend', evidenceStrength: 'medium', evidence: 'Consistent utility-first styling with a coherent design system.' },
      { name: 'REST API Design', category: 'Backend', evidenceStrength: 'medium', evidence: 'Resource-oriented endpoints with validation and error handling.' },
      { name: 'Git', category: 'Tooling', evidenceStrength: 'strong', evidence: 'Consistent, well-scoped commit history across projects.' },
    ],
    potentialRoles: [
      { title: 'Full-Stack Developer', fitLevel: 'Strong Fit', reasoning: 'Demonstrated end-to-end ownership across frontend, API, and database layers.' },
      { title: 'Frontend Engineer', fitLevel: 'Strong Fit', reasoning: `Deep React + ${primaryLang} experience with attention to UI quality.` },
      { title: 'Product Engineer', fitLevel: 'Good Fit', reasoning: 'Ships complete, user-facing features and reasons about the product, not just the code.' },
    ],
    workPatterns: {
      consistency: 'Regular commit activity sustained over more than a year.',
      collaboration: 'Contributes to shared repositories and uses pull requests and issues.',
      documentationQuality: 'Good — most projects include a clear README with setup instructions.',
    },
    competencies: {
      technical: 84,
      problemSolving: 80,
      communication: 74,
      collaboration: 78,
    },
  }
}

// --- GitHub evidence analysis --------------------------------------------

export function mockGitHubAnalysis(
  repositories: GitHubRepo[],
  username: string,
): GitHubAnalysisResult {
  const langs = Array.from(
    new Set(repositories.map((r) => r.language).filter((l): l is string => !!l)),
  )
  const topLanguages = (langs.length ? langs : DEFAULT_LANGUAGES).slice(0, 5)
  const primaryLang = topLanguages[0] ?? 'TypeScript'

  const named = repositories.filter((r) => !r.fork).slice(0, 3)
  const projectHighlights =
    named.length > 0
      ? named.map((r) => ({
          name: r.name,
          significance:
            r.description?.trim() ||
            `A ${r.language ?? primaryLang} project demonstrating hands-on implementation and end-to-end delivery.`,
        }))
      : [
          { name: 'portfolio-site', significance: 'Personal portfolio built and deployed to production.' },
          { name: 'task-api', significance: 'REST API with authentication and a relational data layer.' },
        ]

  return {
    primaryRole: 'Full-Stack Developer',
    experienceLevel: 'Mid-level',
    topLanguages,
    detectedSkills: [
      { name: primaryLang, evidence: `Primary language across ${Math.max(repositories.length, 3)} repositories.`, strength: 'strong' },
      { name: 'React', evidence: 'Component-driven UIs in multiple projects.', strength: 'strong' },
      { name: 'Node.js', evidence: 'Backend services and tooling.', strength: 'strong' },
      { name: 'PostgreSQL', evidence: 'Relational persistence with an ORM.', strength: 'medium' },
      { name: 'Docker', evidence: 'Containerised at least one project for deployment.', strength: 'emerging' },
    ],
    projectHighlights,
    workPatterns: {
      consistency: 'Regular commits sustained over an extended period.',
      collaboration: `${repositories.filter((r) => r.fork).length || 3} contributed/forked repositories with issue and PR activity.`,
      documentationQuality: 'Good — most repositories include READMEs with setup and usage.',
    },
    summary:
      `@${username} shows the profile of a productive full-stack developer working primarily in ${primaryLang} and React. ` +
      `The repositories favour complete, deployable applications over throwaway experiments, and combine a typed frontend with real APIs and databases.\n\n` +
      `Commit cadence and project structure suggest solid engineering habits; the main opportunities are in automated testing and CI to move from "works" to "verifiably reliable".`,
    strengthAreas: ['Full-Stack Development', 'Frontend Engineering', 'API Design'],
    growthAreas: ['Automated Testing', 'CI/CD'],
    potentialRoles: ['Full-Stack Developer', 'Frontend Engineer', 'Product Engineer'],
  }
}

// --- job description competency framework ---------------------------------

export function mockJobDescriptionAnalysis(
  title: string,
  _description: string,
  _requirements?: string | null,
): JobDescriptionAnalysis {
  const cleanTitle = title.trim() || 'Software Engineer'
  const competencies: JobCompetency[] = [
    { name: 'React & TypeScript', importance: 'Critical' as CompetencyImportance, weight: 24, rationale: 'Core of the frontend stack; referenced throughout the description.' },
    { name: 'API Development', importance: 'Critical' as CompetencyImportance, weight: 20, rationale: 'The role owns backend endpoints and integrations.' },
    { name: 'Database Design', importance: 'Important' as CompetencyImportance, weight: 18, rationale: 'Requires modelling and querying relational data.' },
    { name: 'System Design', importance: 'Important' as CompetencyImportance, weight: 16, rationale: 'Expected to reason about architecture and trade-offs.' },
    { name: 'Testing & Quality', importance: 'Important' as CompetencyImportance, weight: 12, rationale: 'Emphasis on maintainable, well-tested code.' },
    { name: 'Collaboration & Communication', importance: 'Nice to Have' as CompetencyImportance, weight: 10, rationale: 'Works cross-functionally with product and design.' },
  ]
  // weights: 24+20+18+16+12+10 = 100

  return {
    competencies,
    suggestedTitle: cleanTitle,
    experienceLevel: 'Mid-level',
    keyResponsibilities: [
      'Build and maintain user-facing features across the stack',
      'Design and implement REST APIs and data models',
      'Collaborate with product and design to ship iteratively',
      'Uphold code quality through review and testing',
    ],
    niceToHave: ['Next.js App Router experience', 'Cloud deployment (Vercel/AWS)', 'CI/CD pipelines'],
  }
}

// --- interview questions --------------------------------------------------

export function mockInterviewQuestions(
  candidate: InterviewCandidateProfile,
  jobCompetencies: string[],
): InterviewQuestions {
  const skill = candidate.detectedSkills[0] ?? 'React'
  const repo = candidate.topRepos[0]?.name
  const comp = jobCompetencies[0] ?? 'API Development'
  const secondComp = jobCompetencies[1] ?? 'Database Design'

  return {
    technical: [
      {
        question: repo
          ? `Walk me through the architecture of ${repo} — how is data fetched, where does state live, and what would you change if traffic grew 100x?`
          : `Walk me through the architecture of a recent project — how is data fetched, where does state live, and what would you change if traffic grew 100x?`,
        rationale: 'Probes real system-design reasoning against something the candidate actually built.',
        targetCompetency: 'System Design',
      },
      {
        question: `You listed ${skill} as a core skill. Describe a bug or performance issue you hit with it and exactly how you diagnosed and fixed it.`,
        rationale: `Verifies depth in ${skill} beyond surface familiarity.`,
        targetCompetency: skill,
      },
      {
        question: `How do you design a ${comp.toLowerCase()} that other engineers will consume — what do you do about validation, versioning, and error handling?`,
        rationale: `Targets the ${comp} competency the role depends on.`,
        targetCompetency: comp,
      },
    ],
    behavioural: [
      {
        question: 'Tell me about a time you shipped something under a tight deadline. What did you cut, and what did you refuse to compromise on?',
        rationale: 'Reveals prioritisation and quality judgement under pressure.',
      },
      {
        question: 'Describe a disagreement with a teammate about a technical decision. How was it resolved and what did you learn?',
        rationale: 'Assesses collaboration and how the candidate handles conflict.',
      },
    ],
    verification: [
      {
        question: repo
          ? `In ${repo}, what was the hardest part to get right, and which part are you least happy with today?`
          : 'On your most significant project, what was the hardest part to get right, and which part are you least happy with today?',
        whatToVerify: 'That the candidate personally did the work and can reflect critically on it.',
      },
      {
        question: `If we pair-programmed on a ${secondComp.toLowerCase()} task right now, how would you start?`,
        whatToVerify: `Hands-on fluency in ${secondComp} rather than theoretical knowledge.`,
      },
    ],
  }
}
