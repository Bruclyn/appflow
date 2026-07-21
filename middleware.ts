import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const CANDIDATE_PREFIXES = [
  '/dashboard',
  '/profile',
  '/evidence',
  '/insights',
  '/jobs',
  '/settings',
]
const RECRUITER_PREFIXES = ['/recruiter']

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isCandidateArea = matchesPrefix(pathname, CANDIDATE_PREFIXES)
  const isRecruiterArea = matchesPrefix(pathname, RECRUITER_PREFIXES)

  if (!isCandidateArea && !isRecruiterArea) {
    return NextResponse.next()
  }

  // Unauthenticated -> login, remembering the intended destination.
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string | undefined
  const isAdmin = role === 'ADMIN'

  // Wrong role -> bounce to the correct dashboard (admins may go anywhere).
  if (isCandidateArea && role !== 'CANDIDATE' && !isAdmin) {
    return NextResponse.redirect(new URL('/recruiter/dashboard', req.url))
  }
  if (isRecruiterArea && role !== 'RECRUITER' && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/profile',
    '/profile/:path*',
    '/evidence',
    '/evidence/:path*',
    '/insights',
    '/insights/:path*',
    '/jobs',
    '/jobs/:path*',
    '/settings',
    '/settings/:path*',
    '/recruiter',
    '/recruiter/:path*',
  ],
}
