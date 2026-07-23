import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RecruiterNav } from '@/components/layout/RecruiterNav'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'RECRUITER') {
    redirect('/login')
  }

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    select: { companyName: true, companyLogo: true },
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <RecruiterNav
        name={session.user.name ?? 'Recruiter'}
        email={session.user.email ?? ''}
        companyName={profile?.companyName ?? null}
        companyLogo={profile?.companyLogo ?? null}
      />
      <div className="md:pl-[260px]">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 md:pb-10">
          {children}
        </div>
      </div>
    </div>
  )
}
