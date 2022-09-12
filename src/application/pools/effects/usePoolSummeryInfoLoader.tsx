import jFetch from '@/functions/dom/jFetch'
import { useEffect } from 'react'
import { poolsAtom } from '../atom'
import { usePools } from '../usePools'

type InfoResponse = {
  tvl: string | number
  totalvolume: string | number
  volume24h: string | number
}

/** load tvl and volumn24h */
export default function usePoolSummeryInfoLoader() {
  const refreshCount = usePools((s) => s.refreshCount)
  const tvl = usePools((s) => s.tvl)
  const volume24h = usePools((s) => s.volume24h)

  const fetchSummeryInfo = async () => {
    if (tvl && volume24h) return // if it has store value, then use it rather than refetching
    const summeryInfo = await jFetch<InfoResponse>('https://api.raydium.io/v2/main/info', {
      ignoreCache: true
    })
    if (!summeryInfo) return

    poolsAtom.set({ tvl: summeryInfo.tvl, volume24h: summeryInfo.volume24h })
  }

  useEffect(() => {
    fetchSummeryInfo()
  }, [refreshCount])
}
