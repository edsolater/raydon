import jFetch from '@/functions/dom/jFetch'
import { createXEffect } from '@edsolater/xstore'
import { poolsAtom } from '../atom'
import { JsonPairItemInfo } from '../type'

export const autoRefetchPairJsonInfo = createXEffect(async () => {
  const pairJsonInfo = await jFetch<JsonPairItemInfo[]>('https://api.raydium.io/v2/main/pairs')
  if (!pairJsonInfo) return
  poolsAtom.set({ jsonInfos: pairJsonInfo.filter(({ name }) => !name.includes('unknown')) })
}, [poolsAtom.subscribe.refreshCount])
