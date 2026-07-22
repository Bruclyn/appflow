import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getCandidateContext } from '@/lib/candidate-api'
import { buildGitHubAuthorizeUrl } from '@/lib/github'

export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const ctx = await getCandidateContext()
  if (!ctx.ok) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(`${origin}/evidence?error=github_not_configured`)
  }

  const state = randomBytes(16).toString('hex')
  const redirectUri = `${origin}/api/evidence/github/callback`
  const authorizeUrl = buildGitHubAuthorizeUrl(clientId, state, redirectUri)

  const res = NextResponse.redirect(authorizeUrl)
  res.cookies.set('gh_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}
