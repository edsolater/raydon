import { PublicKeyish } from '@raydium-io/raydium-sdk'
import toPubString from '@/functions/format/toMintString'
import { gte } from '@/functions/numberish/compare'
import { div } from '@/functions/numberish/operations'
import { toDataMint, WSOLMint } from '../../token'
import { ETHMint, mSOLMint, PAIMint, RAYMint, stSOLMint, USDCMint, USDHMint, USDTMint } from '../../token'
import { sdkParseJsonLiquidityInfo } from './sdkParseJsonLiquidityInfo'
import { liquidityAtom } from '../atom'

export async function findLiquidityInfoByTokenMint(
  coin1Mintlike: PublicKeyish | undefined,
  coin2Mintlike: PublicKeyish | undefined
) {
  const coin1Mint = toDataMint(coin1Mintlike)
  const coin2Mint = toDataMint(coin2Mintlike)
  if (!coin1Mint || !coin2Mint) return { availables: [], best: undefined, routeRelated: [] }

  const mint1 = toPubString(coin1Mint)
  const mint2 = toPubString(coin2Mint)

  const availables = liquidityAtom
    .get()
    .jsonInfos.filter(
      (info) =>
        (info.baseMint === mint1 && info.quoteMint === mint2) || (info.baseMint === mint2 && info.quoteMint === mint1)
    )

  /** swap's route transaction middle token  */
  const routeMiddleMints = [USDCMint, RAYMint, WSOLMint, mSOLMint, PAIMint, stSOLMint, USDHMint, USDTMint, ETHMint].map(
    toPubString
  )
  const candidateTokenMints = routeMiddleMints.concat([mint1, mint2])
  const onlyRouteMints = routeMiddleMints.filter((routeMint) => ![mint1, mint2].includes(routeMint))
  const routeRelated = liquidityAtom.get().jsonInfos.filter((info) => {
    const isCandidate = candidateTokenMints.includes(info.baseMint) && candidateTokenMints.includes(info.quoteMint)
    const onlyInRoute = onlyRouteMints.includes(info.baseMint) && onlyRouteMints.includes(info.quoteMint)
    return isCandidate && !onlyInRoute
  })

  const best = await (async () => {
    if (availables.length === 0) return undefined
    if (availables.length === 1) return availables[0]
    const officials = availables.filter((info) => liquidityAtom.get().officialIds.has(info.id))
    if (officials.length === 1) return officials[0]
    // may be all official pools or all permissionless pools
    const sameLevels = await sdkParseJsonLiquidityInfo(officials.length ? officials : availables)
    // have most lp Supply
    const largest = sameLevels.reduce((acc, curr) => {
      const accIsStable = acc.version === 5
      const currIsStable = curr.version === 5
      if (accIsStable && !currIsStable) return acc
      if (!accIsStable && currIsStable) return curr
      return gte(div(acc.lpSupply, 10 ** acc.lpDecimals), div(curr.lpSupply, 10 ** curr.lpDecimals)) ? acc : curr
    })
    return largest.jsonInfo
  })()

  return { availables, best, routeRelated }
}
