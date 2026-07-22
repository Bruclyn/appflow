'use client'

import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function AnalyzeButton({ analyzed }: { analyzed: boolean }) {
  const router = useRouter()

  return (
    <Button
      variant="ai"
      className="w-full"
      onClick={() => router.push('/insights')}
    >
      <Sparkles className="h-4 w-4" />
      {analyzed ? 'Re-analyze Profile' : 'Analyze My Profile'}
    </Button>
  )
}
