import { unifyItem } from '@/functions/arrayMethods'
import jFetch from '@/functions/dom/jFetch'
import toTokenPrice from '@/functions/format/toTokenPrice'
import { lazyMap } from '@/functions/lazyMap'
import { useEffectWithTransition } from '@/hooks/useEffectWithTransition'
import { HexAddress } from '@/types/constants'
import { useXStore } from '@edsolater/xstore'
import { Price } from '@raydium-io/raydium-sdk'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import useLiquidity from '../../liquidity/useLiquidity'
import { tokenAtom } from '../../token'
import useWallet from '../../wallet/useWallet'
import { poolsAtom } from '../atom'
import { JsonPairItemInfo } from '../type'
import { usePools } from '../usePools'
import { hydratedPairInfo } from '../utils/hydratedPairInfo'

export default function usePoolsInfoLoader() {
  const jsonInfo = usePools((s) => s.jsonInfos)
  const liquidityJsonInfos = useLiquidity((s) => s.jsonInfos)
  const stableLiquidityJsonInfoLpMints = useMemo(
    () => unifyItem(liquidityJsonInfos.filter((j) => j.version === 5).map((j) => j.lpMint)),
    [liquidityJsonInfos]
  )

  const { getToken, tokens, getLpToken, lpTokens } = useXStore(tokenAtom)
  const balances = useWallet((s) => s.balances)
  const { pathname } = useRouter()
  const refreshCount = usePools((s) => s.refreshCount)

  const fetchPairs = async () => {
    // console.time('load pair json')
    const pairJsonInfo = await jFetch<JsonPairItemInfo[]>('https://api.raydium.io/v2/main/pairs')
    if (!pairJsonInfo) return
    poolsAtom.set({ jsonInfos: pairJsonInfo.filter(({ name }) => !name.includes('unknown')) })
    // console.timeEnd('load pair json')
  }

  useEffectWithTransition(() => {
    fetchPairs()
  }, [refreshCount])

  // TODO: currently also fetch info when it's not
  useEffect(() => {
    if (!pathname.includes('/pools/') && !pathname.includes('/liquidity/')) return
    const timeoutId = setInterval(poolsAtom.get().refreshPools, 15 * 60 * 1000)
    return () => clearInterval(timeoutId)
  }, [pathname])

  const lpPrices = useMemo<Record<HexAddress, Price>>(
    () =>
      Object.fromEntries(
        jsonInfo
          .map((value) => {
            const token = lpTokens[value.lpMint]
            const price = token && value.lpPrice ? toTokenPrice(token, value.lpPrice, { alreadyDecimaled: true }) : null
            return [value.lpMint, price]
          })
          .filter(([lpMint, price]) => lpMint != null && price != null)
      ),
    [jsonInfo, lpTokens]
  )

  useEffect(() => {
    poolsAtom.set({ lpPrices })
  }, [lpPrices])

  useEffectWithTransition(async () => {
    const hydratedInfos = await lazyMap({
      source: jsonInfo,
      sourceKey: 'pair jsonInfo',
      loopFn: (pair) =>
        hydratedPairInfo(pair, {
          lpToken: getLpToken(pair.lpMint),
          lpBalance: balances[String(pair.lpMint)],
          isStable: stableLiquidityJsonInfoLpMints.includes(pair.lpMint)
        })
    })
    poolsAtom.set({ hydratedInfos, loading: hydratedInfos.length === 0 })
  }, [jsonInfo, getToken, balances, lpTokens, tokens, stableLiquidityJsonInfoLpMints])
}
