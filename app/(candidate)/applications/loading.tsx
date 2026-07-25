import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton width={180} height={28} />
        <Skeleton width={32} height={22} className="rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton width={70} height={14} />
            <Skeleton width={40} height={26} className="mt-2" />
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="flex flex-wrap items-center gap-4 p-5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton width="45%" height={18} />
              <Skeleton width="30%" height={14} />
              <Skeleton width="60%" height={12} />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton width={80} height={22} className="rounded-full" />
              <Skeleton width={70} height={20} className="rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
