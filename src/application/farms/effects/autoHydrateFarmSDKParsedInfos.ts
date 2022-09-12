import useLiquidity from '@/application/liquidity/useLiquidity'
import { offsetDateTime } from '@/functions/date/dateFormat'
import { lazyMap } from '@/functions/lazyMap'
import { createXEffect } from '@edsolater/xstore'
import { connectionAtom } from '../../connection'
import { usePools } from '../../pools/usePools'
import { tokenAtom } from '../../token'
import { hydrateFarmInfo } from '../utils/handleFarmInfo'
import { farmAtom } from '../atom'
import { getSlotCountForSecond } from '../utils/getSlotCountForSecond'
import { liquidityAtom } from '@/application/liquidity/atom'

export const autoHydrateFarmSDKParsedInfos = createXEffect(async () => {
  const { sdkParsedInfos } = farmAtom.get()
  const { jsonInfos: liquidityJsonInfos } = liquidityAtom.get()
  const { jsonInfos: pairs } = usePools.getState()
  const { getToken, getLpToken, tokenPrices } = tokenAtom.get()
  const { lpPrices } = usePools.getState()
  const { chainTimeOffset = 0, currentEndPoint } = connectionAtom.get()

  const currentBlockChainDate = offsetDateTime(Date.now() + chainTimeOffset, { minutes: 0 /* force */ })
  const aprs = Object.fromEntries(pairs.map((i) => [i.ammId, { apr30d: i.apr30d, apr7d: i.apr7d, apr24h: i.apr24h }]))

  const blockSlotCountForSecond = await getSlotCountForSecond(currentEndPoint)
  const hydratedInfos = await lazyMap({
    source: sdkParsedInfos,
    sourceKey: 'hydrate farm info',
    loopFn: (farmInfo) =>
      hydrateFarmInfo(farmInfo, {
        getToken,
        getLpToken,
        lpPrices,
        tokenPrices,
        liquidityJsonInfos,
        blockSlotCountForSecond,
        aprs,
        currentBlockChainDate,
        chainTimeOffset // same as currentBlockChainDate
      })
  })
  farmAtom.set({ hydratedInfos, isLoading: hydratedInfos.length <= 0 })
}, [
  // poolAtom.subscribe.jsonInfos, // TEMP complete when poolAtom is ready
  farmAtom.subscribe.sdkParsedInfos,
  tokenAtom.subscribe.tokens,
  // poolAtom.subscribe.lpPrices, // TEMP complete when poolAtom is ready
  tokenAtom.subscribe.tokenPrices,
  tokenAtom.subscribe.lpTokens,
  // liquidityAtom.subscribe.jsonInfos, // TEMP complete when liquidityAtom is ready
  connectionAtom.subscribe.chainTimeOffset
])
