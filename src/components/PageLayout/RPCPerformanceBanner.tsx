import React, { useState } from 'react'
import useConnection from '@/application/connection/useConnection'
import jFetch from '@/functions/dom/jFetch'
import useAsyncEffect from '@/hooks/useAsyncEffect'
import { FadeIn } from '../../tempUikits/FadeIn'
import { Div } from '@/../../uikit/dist'

export function RPCPerformanceBanner({ className }: { className?: string }) {
  const { connection, currentEndPoint } = useConnection()
  const [isLowRpcPerformance, setIsLowRpcPerformance] = useState(false)

  const MAX_TPS = 1500 // force settings

  useAsyncEffect(async () => {
    if (isLowRpcPerformance) return // no need calc again
    if (!currentEndPoint?.url) return
    const result = await jFetch<{
      result: {
        numSlots: number
        numTransactions: number
        samplePeriodSecs: number
        slot: number
      }[]
    }>(currentEndPoint?.url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 'getRecentPerformanceSamples',
        jsonrpc: '2.0',
        method: 'getRecentPerformanceSamples',
        params: [4]
      })
    })
    if (!result) return
    const blocks = result.result
    const perSecond = blocks.map(({ numTransactions }) => numTransactions / 60)
    const tps = perSecond.reduce((a, b) => a + b, 0) / perSecond.length

    setIsLowRpcPerformance(tps < MAX_TPS)
  }, [connection])

  return (
    <div className={className}>
      <FadeIn>
        {isLowRpcPerformance && (
          <Div className="bg-[#dacc363f] text-center text-[#D8CB39] text-sm mobile:text-xs px-4 py-1">
            The Solana network is experiencing congestion or reduced performance. Transactions may fail to send or
            confirm.
          </Div>
        )}
      </FadeIn>
    </div>
  )
}
