'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyParking } from '@/actions/verifications'
import { Shield, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'

interface VerificationSectionProps {
  spotId: string
  currentTier: string
  count: number
}

const tierConfig = {
  unverified: { label: '未検証', color: 'text-muted-foreground', next: '3件の確認で Rider Verified に' },
  rider_verified: { label: 'Rider Verified', color: 'text-amber-600', next: '10件の確認で Community Trusted に' },
  community_trusted: { label: 'Community Trusted', color: 'text-gray-500', next: '25件の確認で Well Established に' },
  well_established: { label: 'Well Established', color: 'text-yellow-600', next: null },
}

export function VerificationSection({ spotId, currentTier, count }: VerificationSectionProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const tier = tierConfig[currentTier as keyof typeof tierConfig] || tierConfig.unverified

  const handleVerify = async (status: 'ok' | 'ng' | 'unknown') => {
    setLoading(true)
    await verifyParking(spotId, status)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          コミュニティ検証
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-3">
          <div className={`text-lg font-semibold ${tier.color}`}>
            {tier.label}
          </div>
          <span className="text-sm text-muted-foreground">({count}件の確認)</span>
        </div>

        {tier.next && (
          <p className="mb-4 text-sm text-muted-foreground">{tier.next}</p>
        )}

        {submitted ? (
          <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            確認ありがとうございます！あなたの確認が反映されました。
          </p>
        ) : (
          <div>
            <p className="mb-3 text-sm">
              実際に訪問して大型バイクの駐車状況を確認しましたか？
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVerify('ok')}
                disabled={loading}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                大型OK
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVerify('ng')}
                disabled={loading}
                className="gap-1"
              >
                <XCircle className="h-4 w-4 text-red-500" />
                大型NG
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleVerify('unknown')}
                disabled={loading}
                className="gap-1"
              >
                <HelpCircle className="h-4 w-4 text-gray-500" />
                不明
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
