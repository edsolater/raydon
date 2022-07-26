import jFetch from '@/functions/dom/jFetch'
import { HexAddress, StringNumber } from '@/types/constants'
import { liquidityAtom } from '../../liquidity/atom'
import { swapAtom } from '../atom'
type KLineResponseShape = {
  // state
  s?: 'ok'
  // time
  t: string[]
  // close (end price of a period of time)
  c: number[]
  // close (start price of a period of time)
  o: number[]
  // highest (highest price of a period of time)
  h: number[]
  // lowest (lowest price of a period of time)
  l: number[]
  // volume (transacted baseToken amount of a period of time)
  v: number[]
}
type KLineResponseShape2 = {
  success: boolean
  data: { time: StringNumber; price: StringNumber }[]
}
// /**@deprecated not flexiable for multi, just use {@link getKLineChartPrices}  */
// export async function getCoingeckoChartPriceData(coingeckoId: string | undefined): Promise<number[]> {
//   if (!coingeckoId) return []
//   const response = await jFetch(
//     `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1`
//   )
//   if (!response) return []
//   return response.prices.map(([, price]) => price)
// }

export function recordKLineData({ marketId, priceData }: { marketId: HexAddress; priceData: number[] }): void {
  swapAtom.set((s) => ({ klineData: { ...s.klineData, [marketId]: { priceData, updateTime: Date.now() } } }))
}

export async function fetchKLine({ marketId }: { marketId: HexAddress }): Promise<number[] | undefined> {
  const response = await jFetch<KLineResponseShape2>(`https://api.raydium.io/v2/main/simple-kline?market=${marketId}`, {
    ignoreCache: true
  })
  if (!response) return undefined

  return response.data.map(({ price }) => Number(price))
}

export async function freshKLineChartPrices() {
  const { coin1, coin2 } = swapAtom.get()
  if (!coin1 || !coin2) return
  const { findLiquidityInfoByTokenMint } = liquidityAtom.get()

  // find market ID
  const poolJsonInfo = (await findLiquidityInfoByTokenMint(coin1.mint, coin2.mint)).best

  if (poolJsonInfo) {
    const priceData = await fetchKLine({ marketId: poolJsonInfo.marketId })
    if (priceData) recordKLineData({ marketId: poolJsonInfo.marketId, priceData })
  }
}

export async function getCoingeckoChartPriceData(coingeckoId: string | undefined): Promise<number[]> {
  if (!coingeckoId) return []
  const response = await jFetch(
    `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=1`,
    { cacheFreshTime: 1000 * 60 }
  )
  if (!response) return []
  return response.prices.map(([, price]) => price)
}
