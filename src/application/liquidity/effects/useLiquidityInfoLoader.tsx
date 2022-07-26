import useConnection from '@/application/connection/useConnection'
import { tokenAtom } from '@/application/token'
import useWallet from '@/application/wallet/useWallet'
import { shakeUndifindedItem } from '@/functions/arrayMethods'
import jFetch from '@/functions/dom/jFetch'
import toPubString from '@/functions/format/toMintString'
import { areShallowEqual } from '@/functions/judgers/areEqual'
import { gt } from '@/functions/numberish/compare'
import { useEffectWithTransition } from '@/hooks/useEffectWithTransition'
import { useRecordedEffect } from '@/hooks/useRecordedEffect'
import { HexAddress } from '@/types/constants'
import { useXStore } from '@edsolater/xstore'
import { LiquidityPoolsJsonFile } from '@raydium-io/raydium-sdk'
import { hydrateLiquidityInfo } from '../utils/hydrateLiquidityInfo'
import { sdkParseJsonLiquidityInfo } from '../utils/sdkParseJsonLiquidityInfo'

import { liquidityAtom } from '../atom'

/**
 * will load liquidity info (jsonInfo, sdkParsedInfo, hydratedInfo)
 */
export default function useLiquidityInfoLoader({ disabled }: { disabled?: boolean } = {}) {
  const { jsonInfos, sdkParsedInfos, currentJsonInfo, currentSdkParsedInfo, userExhibitionLiquidityIds } =
    useXStore(liquidityAtom)
  const { getToken, getLpToken } = useXStore(tokenAtom)
  const { refreshCount } = useXStore(liquidityAtom)
  const connection = useConnection((s) => s.connection)
  const rawBalances = useWallet((s) => s.rawBalances)

  /** fetch json info list  */
  useEffectWithTransition(async () => {
    if (disabled) return
    const response = await jFetch<LiquidityPoolsJsonFile>('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
      ignoreCache: true
    })
    const blacklist = await jFetch<HexAddress[]>('/amm-blacklist.json')
    const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
      // no raydium blacklist amm
      .filter((info) => !(blacklist ?? []).includes(info.id))
    const officialIds = new Set(response?.official?.map((i) => i.id))
    const unOfficialIds = new Set(response?.unOfficial?.map((i) => i.id))
    if (liquidityInfoList) liquidityAtom.set({ jsonInfos: liquidityInfoList, officialIds, unOfficialIds })
  }, [disabled])

  /** get userExhibitionLiquidityIds */
  useEffectWithTransition(async () => {
    // when refresh, it will refresh twice. one for rawBalance, one for liquidityRefreshCount
    if (disabled) return
    if (!jsonInfos) return
    const liquidityLpMints = new Set(jsonInfos.map((jsonInfo) => jsonInfo.lpMint))
    const allLpBalance = Object.entries(rawBalances).filter(
      ([mint, tokenAmount]) => liquidityLpMints.has(mint) && gt(tokenAmount, 0)
    )
    const allLpBalanceMint = allLpBalance.map(([mint]) => toPubString(mint))
    const userExhibitionLiquidityIds = jsonInfos
      .filter((jsonInfo) => allLpBalanceMint.includes(jsonInfo.lpMint))
      .map((jsonInfo) => jsonInfo.id)
    liquidityAtom.set({ userExhibitionLiquidityIds })
  }, [disabled, jsonInfos, rawBalances, refreshCount])

  /** json infos ➡ sdkParsed infos (only wallet's LP)  */
  useRecordedEffect(
    async ([prevDisabled, prevConnection, prevJsonInfos, prevUserExhibitionLiquidityIds, prevRefreshCount]) => {
      if (disabled) return
      if (!connection || !jsonInfos.length || !userExhibitionLiquidityIds.length) return

      if (
        prevRefreshCount == refreshCount &&
        areShallowEqual(prevUserExhibitionLiquidityIds, userExhibitionLiquidityIds)
      )
        return

      const sdkParsedInfos = await sdkParseJsonLiquidityInfo(
        jsonInfos.filter((i) => userExhibitionLiquidityIds.includes(i.id)),
        connection
      )
      liquidityAtom.set({ sdkParsedInfos: shakeUndifindedItem(sdkParsedInfos) })
    },
    [disabled, connection, jsonInfos, userExhibitionLiquidityIds, refreshCount] as const
  )

  /** sdkParsed infos (only wallet's LP) ➡  hydrated infos (only wallet's LP)*/
  useEffectWithTransition(async () => {
    if (disabled) return
    const hydratedInfos = sdkParsedInfos.map((liquidityInfo) => {
      const lpBalance = rawBalances[String(liquidityInfo.lpMint)]
      return hydrateLiquidityInfo(liquidityInfo, { getToken, getLpToken, lpBalance })
    })
    liquidityAtom.set({ hydratedInfos })
  }, [disabled, sdkParsedInfos, rawBalances, getToken, getLpToken])

  /** CURRENT jsonInfo ➡ current sdkParsedInfo  */
  useEffectWithTransition(async () => {
    if (disabled) return
    if (connection && currentJsonInfo) {
      liquidityAtom.set({
        currentSdkParsedInfo: (await sdkParseJsonLiquidityInfo([currentJsonInfo], connection))?.[0]
      })
    } else {
      liquidityAtom.set({ currentSdkParsedInfo: undefined })
    }
  }, [disabled, currentJsonInfo, connection, refreshCount])

  /** CURRENT sdkParsedInfo ➡ current hydratedInfo  */
  useEffectWithTransition(async () => {
    if (disabled) return
    if (connection && currentSdkParsedInfo) {
      const lpBalance = rawBalances[String(currentSdkParsedInfo.lpMint)]
      const hydrated = await hydrateLiquidityInfo(currentSdkParsedInfo, { getToken, getLpToken, lpBalance })
      liquidityAtom.set({
        currentHydratedInfo: hydrated
      })
    } else {
      liquidityAtom.set({ currentHydratedInfo: undefined })
    }
  }, [disabled, currentSdkParsedInfo, getToken, getLpToken])
}
