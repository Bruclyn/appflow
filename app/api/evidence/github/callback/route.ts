import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EvidenceType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCandidateContext } from '@/lib/candidate-api'
import { recalculateProfileStrength } from '@/lib/profile-strength-service'
import {
  exchangeCodeForToken,
  fetchUserProfile,
  fetchUserRepositories,
} from '@/lib/github'

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const back = (query: string) =>
    NextResponse.redirect(`${origin}/evidence?${query}`)

  const ctx = await getCandidateContext()
  if (!ctx.ok) return NextResponse.redirect(`${origin}/login`)

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const store = await cookies()
  const storedState = store.get('gh_oauth_state')?.value

  if (!code) return back('error=github_denied')
  if (!state || !storedState || state !== storedState) {
    return back('error=github_state')
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) return back('error=github_not_configured')

  try {
    const redirectUri = `${origin}/api/evidence/github/callback`
    const token = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri)

    const [profile, repos] = await Promise.all([
      fetchUserProfile(token),
      fetchUserRepositories(token),
    ])

    const rawData = { profile, repos } as unknown as Prisma.InputJsonValue
    const existing = await prisma.evidence.findFirst({
      where: { candidateId: ctx.profileId, type: EvidenceType.GITHUB },
    })

    if (existing) {
      await prisma.evidence.update({
        where: { id: existing.id },
        data: {
          url: profile.html_url,
          username: profile.login,
          rawData,
          analyzed: false,
          analyzedAt: null,
        },
      })
    } else {
      await prisma.evidence.create({
        data: {
          candidateId: ctx.profileId,
          type: EvidenceType.GITHUB,
          url: profile.html_url,
          username: profile.login,
          rawData,
        },
      })
    }

    await recalculateProfileStrength(ctx.profileId)

    const res = back('connected=true')
    res.cookies.set('gh_oauth_state', '', { path: '/', maxAge: 0 })
    return res
  } catch (err) {
    console.error('[github callback] error', err)
    return back('error=github_failed')
  }
}
