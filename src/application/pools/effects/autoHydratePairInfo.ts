import { createXEffect } from '@edsolater/xstore'
import { liquidityAtom } from '@/application/liquidity/atom'
import { walletAtom } from '@/application/wallet'
import { unifyItem } from '@/functions/arrayMethods'
import toPubString from '@/functions/format/toMintString'
import { lazyMap } from '@/functions/lazyMap'
import { tokenAtom } from '../../token'
import { poolsAtom } from '../atom'
import { hydratedPairInfo } from '../utils/hydratedPairInfo'

export const autoHydratePairInfo = createXEffect(
  async ([jsonInfos, balances, liquidityJsonInfos]) => {
    const { getLpToken } = tokenAtom.get()

    const stableLiquidityJsonInfoLpMints = unifyItem(
      liquidityJsonInfos.filter((j) => j.version === 5).map((j) => j.lpMint)
    )
    const hydratedInfos = await lazyMap({
      source: jsonInfos,
      sourceKey: 'pair jsonInfo',
      loopFn: (pair) =>
        hydratedPairInfo(pair, {
          lpToken: getLpToken(pair.lpMint),
          lpBalance: balances[toPubString(pair.lpMint)],
          isStable: stableLiquidityJsonInfoLpMints.includes(pair.lpMint)
        })
    })
    poolsAtom.set({ hydratedInfos, loading: hydratedInfos.length === 0 })
  },
  [
    poolsAtom.subscribe.jsonInfos,
    walletAtom.subscribe.balances,
    liquidityAtom.subscribe.jsonInfos,
    tokenAtom.subscribe.lpTokens,
    tokenAtom.subscribe.tokens
  ]
)
