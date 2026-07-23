import { Card } from '@/components/ui/Card'

/** Simple titled placeholder for recruiter areas not yet built out. */
export function RecruiterPlaceholder({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
      <Card className="p-8 text-center text-sm text-slate-500">{message}</Card>
    </div>
  )
}
