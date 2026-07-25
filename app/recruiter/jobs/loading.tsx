import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function RecruiterJobsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton width={100} height={28} />
        <Skeleton width={130} height={44} className="rounded-full" />
      </div>
      <Skeleton width={220} height={40} className="rounded-full" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton width="35%" height={18} />
                <div className="flex gap-2">
                  <Skeleton width={70} height={22} className="rounded-full" />
                  <Skeleton width={70} height={22} className="rounded-full" />
                </div>
                <Skeleton width="50%" height={14} />
              </div>
              <Skeleton width={160} height={36} className="rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
