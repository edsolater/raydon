import { createXEffect, XEffectRegistor } from '@edsolater/xstore'
import toTokenPrice from '@/functions/format/toTokenPrice'
import { HexAddress } from '@/types/constants'
import { Price } from '@raydium-io/raydium-sdk'
import {} from 'next/router'
import { tokenAtom } from '../../token'
import { poolsAtom } from '../atom'

export const autoComposeLpPrices = createXEffect(
  async ([jsonInfos, lpTokens]) => {
    const lpPrices = Object.fromEntries(
      jsonInfos
        .map((value) => {
          const token = lpTokens[value.lpMint]
          const price = token && value.lpPrice ? toTokenPrice(token, value.lpPrice, { alreadyDecimaled: true }) : null
          return [value.lpMint, price]
        })
        .filter(([lpMint, price]) => lpMint != null && price != null)
    ) as Record<HexAddress, Price>
    poolsAtom.set({ lpPrices })
  },
  [poolsAtom.subscribe.jsonInfos, tokenAtom.subscribe.lpTokens]
)
