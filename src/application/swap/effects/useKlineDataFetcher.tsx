import { useXStore } from '@/../../xstore/dist'
import { liquidityAtom } from '@/application/liquidity/atom'
import { useEffect } from 'react'
import { swapAtom } from '../atom'
import { freshKLineChartPrices } from '../utils/klinePrice'

export function useKlineDataFetcher() {
  const { coin1 } = useXStore(swapAtom)
  const { coin2 } = useXStore(swapAtom)
  const { jsonInfos } = useXStore(liquidityAtom)
  const { refreshCount } = useXStore(swapAtom)

  useEffect(() => {
    freshKLineChartPrices()
  }, [coin1, coin2, jsonInfos, refreshCount])
}
