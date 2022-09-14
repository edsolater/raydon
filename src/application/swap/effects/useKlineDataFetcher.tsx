import { useEffect } from 'react'

import { freshKLineChartPrices } from '../utils/klinePrice'
import { useSwap } from '../useSwap'
import { useXStore } from '@/../../xstore/dist'
import { liquidityAtom } from '@/application/liquidity/atom'

export function useKlineDataFetcher() {
  const coin1 = useSwap((s) => s.coin1)
  const coin2 = useSwap((s) => s.coin2)
  const { jsonInfos } = useXStore(liquidityAtom)
  const refreshCount = useSwap((s) => s.refreshCount)

  useEffect(() => {
    freshKLineChartPrices()
  }, [coin1, coin2, jsonInfos, refreshCount])
}
