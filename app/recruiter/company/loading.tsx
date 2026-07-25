import { Skeleton } from '@/components/ui/Skeleton'

function FormCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-card">
      <Skeleton width={140} height={18} />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width="100%" height={44} className="rounded-md" />
        ))}
      </div>
    </div>
  )
}

export default function RecruiterCompanyLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Skeleton width={180} height={28} />
        <Skeleton width={150} height={40} className="rounded-full" />
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-card">
        <div className="flex gap-6">
          <Skeleton width={96} height={96} className="rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton width="50%" height={28} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton width="100%" height={44} />
              <Skeleton width="100%" height={44} />
            </div>
          </div>
        </div>
      </div>

      <FormCardSkeleton rows={2} />
      <FormCardSkeleton rows={2} />
      <FormCardSkeleton rows={1} />
    </div>
  )
}
