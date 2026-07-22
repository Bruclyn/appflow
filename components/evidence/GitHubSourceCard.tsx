'use client'

import { useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SourceCard } from './SourceCard'
import { relativeTime } from './helpers'
import type { GithubState } from './types'

interface GitHubSourceCardProps {
  configured: boolean
  github: GithubState | null
  analyzing: boolean
  onReanalyze: () => void
  onDisconnect: () => void
}

export function GitHubSourceCard({
  configured,
  github,
  analyzing,
  onReanalyze,
  onDisconnect,
}: GitHubSourceCardProps) {
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)

  const badge = !configured ? (
    <Badge variant="neutral">Not Configured</Badge>
  ) : github ? (
    <Badge variant="success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
      Connected as @{github.username}
    </Badge>
  ) : undefined

  return (
    <SourceCard
      icon={<GithubIcon className="h-6 w-6" />}
      title="GitHub"
      description="Analyze your repositories, languages, and project activity"
      badge={badge}
    >
      {!configured ? (
        <button
          type="button"
          disabled
          title="GitHub credentials not set up"
          className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-slate-400"
        >
          Connect GitHub
        </button>
      ) : !github ? (
        <Button
          className="w-full"
          onClick={() => window.location.assign('/api/evidence/github/connect')}
        >
          Connect GitHub
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              isLoading={analyzing}
              onClick={onReanalyze}
            >
              {!analyzing &&
                (github.analyzed ? (
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                ))}
              {github.analyzed ? 'Re-analyze' : 'Analyze'}
            </Button>

            {confirmingDisconnect ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setConfirmingDisconnect(false)
                    onDisconnect()
                  }}
                >
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDisconnect(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-light"
                onClick={() => setConfirmingDisconnect(true)}
              >
                Disconnect
              </Button>
            )}
          </div>

          {github.analyzed && github.analyzedAt && (
            <p className="text-xs text-slate-400">
              Last analyzed {relativeTime(github.analyzedAt)}
            </p>
          )}
        </div>
      )}
    </SourceCard>
  )
}
