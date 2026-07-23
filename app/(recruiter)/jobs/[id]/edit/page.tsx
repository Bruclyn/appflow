import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { JobWizard } from '@/components/recruiter/JobWizard'
import type { JobWizardInitial } from '@/components/recruiter/JobWizard'
import type { JobFramework } from '@/lib/jd-analysis'

type Params = { params: Promise<{ id: string }> }

export default async function EditJobPage({ params }: Params) {
  const ctx = await getRecruiterContext()
  if (!ctx.ok) redirect('/login')
  const { id } = await params

  const job = await prisma.job.findFirst({
    where: { id, recruiterId: ctx.profileId },
  })
  if (!job) redirect('/recruiter/jobs')

  const framework = job.competencyFramework as unknown as JobFramework | null

  const initial: JobWizardInitial = {
    title: job.title,
    description: job.description,
    requirements: job.requirements ?? '',
    location: job.location ?? '',
    jobType: job.jobType ?? '',
    salaryMin: job.salaryMin != null ? String(job.salaryMin) : '',
    salaryMax: job.salaryMax != null ? String(job.salaryMax) : '',
    competencies: framework?.competencies ?? [],
    experienceLevel: framework?.experienceLevel,
    keyResponsibilities: framework?.keyResponsibilities,
    niceToHave: framework?.niceToHave,
  }

  return <JobWizard mode="edit" jobId={id} initial={initial} />
}
