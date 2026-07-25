import { Skeleton } from '@/components/ui/Skeleton'

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-card">
      <Skeleton width={140} height={18} />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width="100%" height={56} className="rounded-md" />
        ))}
      </div>
    </div>
  )
}

export default function ProfileLoading() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton width={140} height={28} />
        <Skeleton width={320} height={16} className="mt-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 shadow-card">
            <div className="flex gap-6">
              <Skeleton width={96} height={96} className="rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton width="60%" height={28} />
                <Skeleton width="80%" height={20} />
                <Skeleton width="50%" height={20} />
              </div>
            </div>
          </div>
          <SectionSkeleton rows={1} />
          <SectionSkeleton rows={2} />
          <SectionSkeleton rows={2} />
          <SectionSkeleton rows={1} />
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-card">
          <Skeleton width={120} height={18} />
          <Skeleton width="100%" height={10} className="mt-4 rounded-full" />
        </div>
      </div>
    </div>
  )
}
