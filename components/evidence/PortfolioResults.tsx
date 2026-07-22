import { ExternalLink, Globe } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface PortfolioResultsProps {
  url: string
  analyzed: boolean
  /** When provided, renders the "Analyze Now" action (client-only). */
  onAnalyze?: () => void
}

export function PortfolioResults({
  url,
  analyzed,
  onAnalyze,
}: PortfolioResultsProps) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-slate-900">
        Portfolio
      </h2>
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-slate-100 text-slate-700">
          <Globe className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 truncate text-sm font-medium text-primary hover:underline"
          >
            <span className="truncate">{url}</span>
            <ExternalLink className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          </a>
        </div>
        <Badge variant={analyzed ? 'success' : 'warning'}>
          {analyzed ? 'Analyzed' : 'Pending Analysis'}
        </Badge>
        {!analyzed && onAnalyze && (
          <Button variant="ai" size="sm" onClick={onAnalyze}>
            Analyze Now
          </Button>
        )}
      </Card>
    </section>
  )
}
