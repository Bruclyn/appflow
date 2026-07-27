import { ResetPasswordForm } from './ResetPasswordForm'

// Server component: read the token from the URL and hand it to the client form.
// This lets the card + heading server-render (no blank flash) and avoids the
// useSearchParams/Suspense dance.
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <ResetPasswordForm token={token ?? ''} />
}
