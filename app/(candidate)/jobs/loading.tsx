import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

function JobCardSkeleton() {
  return (
    <Card className="flex flex-wrap items-start gap-4 p-5">
      <Skeleton width={44} height={44} className="rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton width="50%" height={18} />
        <Skeleton width="30%" height={14} />
        <div className="flex gap-2">
          <Skeleton width={70} height={22} className="rounded-full" />
          <Skeleton width={70} height={22} className="rounded-full" />
        </div>
      </div>
      <div className="flex flex-none flex-col items-end gap-2">
        <Skeleton width={50} height={28} className="rounded-full" />
        <Skeleton width={90} height={32} className="rounded-full" />
      </div>
    </Card>
  )
}

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton width={160} height={28} />
        <Skeleton width={260} height={16} className="mt-2" />
      </div>
      <Skeleton width="100%" height={44} className="rounded-md" />
      <div className="space-y-3">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    </div>
  )
}
