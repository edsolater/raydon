import { HexAddress, SrcAddress } from '@/types/constants'
import { Token } from '@raydium-io/raydium-sdk'
import { TokenJson, SplToken } from '../type'

export function createSplToken(
  info: Partial<TokenJson> & {
    mint: HexAddress
    decimals: number
    userAdded?: boolean /* only if token is added by user */
  },
  customTokenIcons?: Record<string, SrcAddress>
): SplToken {
  const { mint, symbol, name = symbol, decimals, ...rest } = info
  // TODO: recordPubString(token.mint)
  const splToken = Object.assign(new Token(mint, decimals, symbol, name), { icon: '', extensions: {}, id: mint }, rest)
  if (customTokenIcons?.[mint]) {
    splToken.icon = customTokenIcons[mint] ?? ''
  }
  return splToken
}
