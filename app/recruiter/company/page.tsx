import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRecruiterContext } from '@/lib/recruiter-api'
import { CompanyEditor } from '@/components/recruiter/company/CompanyEditor'
import type { CompanyInitial } from '@/components/recruiter/company/CompanyEditor'

export default async function RecruiterCompanyPage() {
  const [ctx, session] = await Promise.all([
    getRecruiterContext(),
    getServerSession(authOptions),
  ])
  if (!ctx.ok || !session?.user) redirect('/login')

  const profile = await prisma.recruiterProfile.findUnique({
    where: { id: ctx.profileId },
  })
  if (!profile) redirect('/login')

  const initial: CompanyInitial = {
    companyName: profile.companyName ?? '',
    companyLogo: profile.companyLogo,
    industry: profile.industry ?? '',
    companySize: profile.companySize ?? '',
    website: profile.website ?? '',
    location: profile.location ?? '',
    description: profile.description ?? '',
    whatWeLookFor: profile.whatWeLookFor ?? '',
    preferredJobTypes: Array.isArray(profile.preferredJobTypes)
      ? (profile.preferredJobTypes as string[])
      : [],
    hiringSpeed: profile.hiringSpeed ?? '',
    teamSizeHiring: profile.teamSizeHiring ?? '',
    userName: session.user.name ?? 'You',
    userEmail: session.user.email ?? '',
  }

  return <CompanyEditor initial={initial} />
}
