import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function RecruiterDashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton width={200} height={28} />
        <Skeleton width={130} height={44} className="rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton width={80} height={14} />
            <Skeleton width={50} height={26} className="mt-2" />
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton width={160} height={20} />
        {[0, 1].map((i) => (
          <Card key={i} className="flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton width="40%" height={18} />
              <Skeleton width="60%" height={14} />
            </div>
            <Skeleton width={120} height={36} className="rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  )
}
