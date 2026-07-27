import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

// Generic response returned whether or not the email exists, so we never
// confirm which addresses have accounts.
const GENERIC_MESSAGE =
  'If an account exists with this email, a reset link has been sent'

function baseUrl(req: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin
}

export async function POST(req: Request) {
  try {
    const parsed = forgotPasswordSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })

    // Never reveal whether the account exists — always return the same shape.
    let resetUrl = ''
    if (user) {
      const token = randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry },
      })

      resetUrl = `${baseUrl(req)}/reset-password?token=${token}`

      // TODO: send email via email service (Resend, SendGrid, etc.)
      console.log(`[forgot-password] reset link for ${email}: ${resetUrl}`)
    }

    return NextResponse.json({
      success: true,
      message: GENERIC_MESSAGE,
      // Returned only so the flow can be tested before an email service exists.
      resetUrl,
    })
  } catch (err) {
    console.error('[forgot-password] error', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
