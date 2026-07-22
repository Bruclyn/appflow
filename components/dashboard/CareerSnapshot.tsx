import { Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AnalyzeButton } from './AnalyzeButton'

export interface CareerSnapshotProps {
  primaryRole: string | null
  strengths: string[] | null
  overallScore: number | null
  lastAnalyzedAt: Date | null
}

export function CareerSnapshot({
  primaryRole,
  strengths,
  overallScore,
  lastAnalyzedAt,
}: CareerSnapshotProps) {
  const analyzed = Boolean(primaryRole)

  return (
    <Card className="flex h-full flex-col border-l-4 border-l-secondary p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-secondary" />
        <h2 className="font-display font-semibold text-slate-900">
          Career Snapshot
        </h2>
        <span className="ml-auto rounded-full bg-secondary-light px-2.5 py-0.5 text-xs font-semibold text-secondary">
          Powered by AI
        </span>
      </div>

      <div className="mt-5 flex-1">
        {analyzed ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xl font-bold text-slate-900">{primaryRole}</p>
              {overallScore !== null && (
                <span className="rounded-full bg-secondary-light px-2.5 py-0.5 text-xs font-semibold text-secondary">
                  {overallScore}% capability
                </span>
              )}
            </div>
            {strengths && strengths.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {strengths.slice(0, 3).map((s) => (
                  <Badge key={s} variant="ai">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {lastAnalyzedAt && (
              <p className="mt-3 text-xs text-muted">
                Last analyzed {format(new Date(lastAnalyzedAt), 'MMM d, yyyy')}
              </p>
            )}
          </>
        ) : (
          <p className="text-lg italic text-muted">Not yet analyzed</p>
        )}
      </div>

      <div className="mt-5">
        <AnalyzeButton analyzed={analyzed} />
      </div>
    </Card>
  )
}
