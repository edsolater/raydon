import { shakeUndifindedItem } from '@/functions/arrayMethods'
import jFetch from '@/functions/dom/jFetch'
import toPubString from '@/functions/format/toMintString'
import { lazyMap } from '@/functions/lazyMap'
import { HexAddress } from '@/types/constants'
import { listToMap } from '@edsolater/fnkit'
import { createXEffect } from '@edsolater/xstore'
import { LiquidityPoolsJsonFile, Token } from '@raydium-io/raydium-sdk'
import { tokenAtom } from '../token/atom'
import { LpToken } from '../token/type'

export const loadLpTokens = createXEffect(async () => {
  const { jsonInfos: ammJsonInfos } = await getLiquidityJsonInfos()
  const userAddedTokens = tokenAtom.get().userAddedTokens
  const getToken = tokenAtom.get().getToken

  const lpTokenItems = await lazyMap({
    source: ammJsonInfos,
    sourceKey: 'load lp token',
    loopFn: (ammJsonInfo) => {
      const baseToken = getToken(ammJsonInfo.baseMint) ?? userAddedTokens[ammJsonInfo.baseMint] // depends on raw user Added tokens for avoid re-render
      const quoteToken = getToken(ammJsonInfo.quoteMint) ?? userAddedTokens[ammJsonInfo.quoteMint]
      if (!baseToken || !quoteToken) return // NOTE :  no unknown base/quote lpToken
      const lpToken = Object.assign(
        new Token(
          ammJsonInfo.lpMint,
          baseToken.decimals,
          `${baseToken.symbol}-${quoteToken.symbol}`,
          `${baseToken.symbol}-${quoteToken.symbol} LP`
        ),
        {
          isLp: true,
          base: baseToken,
          quote: quoteToken,
          icon: '',
          extensions: {}
        }
      ) as LpToken
      return lpToken
    }
  })
  const lpTokens = listToMap(shakeUndifindedItem(lpTokenItems), (t) => toPubString(t.mint))
  tokenAtom.set({ lpTokens, getLpToken: (mint) => lpTokens[toPubString(mint)] })
}, [
  // liquidityAtom.subscribe.jsonInfos,
  tokenAtom.subscribe.tokens,
  tokenAtom.subscribe.userAddedTokens
])

async function getLiquidityJsonInfos() {
  const response = await jFetch<LiquidityPoolsJsonFile>('https://api.raydium.io/v2/sdk/liquidity/mainnet.json', {
    ignoreCache: true
  })
  const blacklist = await jFetch<HexAddress[]>('/amm-blacklist.json')
  const liquidityInfoList = [...(response?.official ?? []), ...(response?.unOfficial ?? [])]
    // no raydium blacklist amm
    .filter((info) => !(blacklist ?? []).includes(info.id))
  const officialIds = new Set(response?.official?.map((i) => i.id))
  const unOfficialIds = new Set(response?.unOfficial?.map((i) => i.id))
  return { jsonInfos: liquidityInfoList, officialIds, unOfficialIds }
}
