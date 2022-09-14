import { unifyItem } from '@/functions/arrayMethods'
import jFetch from '@/functions/dom/jFetch'
import toTokenPrice from '@/functions/format/toTokenPrice'
import { lazyMap } from '@/functions/lazyMap'
import { useEffectWithTransition } from '@/hooks/useEffectWithTransition'
import { HexAddress } from '@/types/constants'
import { createXEffect, useXStore } from '@edsolater/xstore'
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
import {} from 'next/router'
import { routerAtom } from '@/application/router/atom'
import { liquidityAtom } from '@/application/liquidity/atom'
import { walletAtom } from '@/application/wallet'

export default function usePoolsInfoLoader() {
  const { jsonInfos: liquidityJsonInfos } = liquidityAtom.get()
  const stableLiquidityJsonInfoLpMints = unifyItem(
    liquidityJsonInfos.filter((j) => j.version === 5).map((j) => j.lpMint)
  )

  const { getToken, tokens, getLpToken, lpTokens } = tokenAtom.get()
  const { balances } = walletAtom.get()
  const { pathname } = routerAtom.get()
  const { refreshCount, jsonInfos } = poolsAtom.get()

  const lpPrices = Object.fromEntries(
    jsonInfos
      .map((value) => {
        const token = lpTokens[value.lpMint]
        const price = token && value.lpPrice ? toTokenPrice(token, value.lpPrice, { alreadyDecimaled: true }) : null
        return [value.lpMint, price]
      })
      .filter(([lpMint, price]) => lpMint != null && price != null)
  ) as Record<HexAddress, Price>

  useEffect(() => {
    poolsAtom.set({ lpPrices })
  }, [lpPrices])

  useEffectWithTransition(async () => {
    const hydratedInfos = await lazyMap({
      source: jsonInfos,
      sourceKey: 'pair jsonInfo',
      loopFn: (pair) =>
        hydratedPairInfo(pair, {
          lpToken: getLpToken(pair.lpMint),
          lpBalance: balances[String(pair.lpMint)],
          isStable: stableLiquidityJsonInfoLpMints.includes(pair.lpMint)
        })
    })
    poolsAtom.set({ hydratedInfos, loading: hydratedInfos.length === 0 })
  }, [jsonInfos, balances, lpTokens, tokens, stableLiquidityJsonInfoLpMints])
}

const autoRefetchPairJsonInfo = createXEffect(async () => {
  const pairJsonInfo = await jFetch<JsonPairItemInfo[]>('https://api.raydium.io/v2/main/pairs')
  if (!pairJsonInfo) return
  poolsAtom.set({ jsonInfos: pairJsonInfo.filter(({ name }) => !name.includes('unknown')) })
}, [poolsAtom.subscribe.refreshCount])

const startPoolIntervalRefresh = createXEffect(
  ([pathname]) => {
    if (!pathname.includes('/pools/') && !pathname.includes('/liquidity/')) return
    const timeoutId = setInterval(poolsAtom.get().refreshPools, 15 * 60 * 1000)
    return () => clearInterval(timeoutId)
  },
  [routerAtom.subscribe.pathname]
)
