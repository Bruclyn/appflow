import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  const isCandidateArea = pathname.startsWith('/dashboard')
  const isRecruiterArea = pathname.startsWith('/recruiter')

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
    return NextResponse.redirect(new URL('/recruiter', req.url))
  }
  if (isRecruiterArea && role !== 'RECRUITER' && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/recruiter/:path*'],
}
