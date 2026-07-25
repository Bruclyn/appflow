import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Skeleton width={140} height={28} />
        <Skeleton width={160} height={16} />
      </div>

      <Card className="p-6">
        <Skeleton width={160} height={18} />
        <Skeleton width="100%" height={10} className="mt-4 rounded-full" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={40} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <Skeleton width={140} height={18} />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} width="100%" height={20} />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <Skeleton width={140} height={18} />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={40} height={40} className="rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton width="70%" height={14} />
                  <Skeleton width="40%" height={12} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <Skeleton width={160} height={18} />
        <div className="mt-4 space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={16} />
          ))}
        </div>
      </Card>
    </div>
  )
}
