import jFetch from '@/functions/dom/jFetch'
import { createXEffect } from '@edsolater/xstore'
import { poolsAtom } from '../atom'

type InfoResponse = {
  tvl: string | number
  totalvolume: string | number
  volume24h: string | number
}

/** load tvl and volumn24h */
export const autoRefreshTvlAndVolume24hData = createXEffect(async () => {
  const { tvl, volume24h } = poolsAtom.get()
  if (tvl && volume24h) return // if it has store value, then use it rather than refetching
  const summeryInfo = await jFetch<InfoResponse>('https://api.raydium.io/v2/main/info')
  if (!summeryInfo) return
  poolsAtom.set({ tvl: summeryInfo.tvl, volume24h: summeryInfo.volume24h })
}, [poolsAtom.subscribe.refreshCount])
