import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

function SourceCardSkeleton() {
  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between">
        <Skeleton width={44} height={44} className="rounded-md" />
        <Skeleton width={90} height={22} className="rounded-full" />
      </div>
      <Skeleton width={120} height={18} className="mt-4" />
      <Skeleton width="100%" height={14} className="mt-2" />
      <Skeleton width="80%" height={14} className="mt-1.5" />
      <Skeleton width="100%" height={44} className="mt-4 rounded-full" />
    </Card>
  )
}

export default function EvidenceLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton width={220} height={28} />
        <Skeleton width={360} height={16} className="mt-2" />
      </div>
      <Skeleton width="100%" height={48} className="rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SourceCardSkeleton />
        <SourceCardSkeleton />
        <SourceCardSkeleton />
        <SourceCardSkeleton />
      </div>
    </div>
  )
}
