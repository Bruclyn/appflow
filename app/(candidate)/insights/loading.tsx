import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function InsightsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Skeleton width={24} height={24} className="rounded-full" />
          <Skeleton width={160} height={28} />
        </div>
        <Skeleton width={280} height={16} className="mt-2" />
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Skeleton width={72} height={72} className="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton width="50%" height={22} />
            <Skeleton width="30%" height={16} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton width={80} height={16} />
            <Skeleton width="100%" height={28} className="mt-3" />
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <Skeleton width={160} height={18} />
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={16} />
          ))}
        </div>
      </Card>
    </div>
  )
}
