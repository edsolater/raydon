import jFetch from '@/functions/dom/jFetch'
import { Endpoint } from '../../connection'

/**
 * to calc apr use true onChain block slot count
 */

export async function getSlotCountForSecond(currentEndPoint: Endpoint | undefined): Promise<number> {
  if (!currentEndPoint) return 2
  const result = await jFetch<{
    result: {
      numSlots: number
      numTransactions: number
      samplePeriodSecs: number
      slot: number
    }[]
  }>(currentEndPoint.url, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'getRecentPerformanceSamples',
      jsonrpc: '2.0',
      method: 'getRecentPerformanceSamples',
      params: [100]
    })
  })
  if (!result) return 2

  const performanceList = result.result
  const slotList = performanceList.map((item) => item.numSlots)
  return slotList.reduce((a, b) => a + b, 0) / slotList.length / 60
}
