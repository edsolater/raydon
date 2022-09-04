import { tokenAtom } from '../atom'
import { createSplToken } from './createSplToken'
import { getOnlineTokenDecimals } from './getOnlineTokenInfo'
import { SplToken } from '../type'

/**
 *
 * @param mint
 * @param symbol symbol can be empty string, (means use the start of mint to be it's temp symbol)
 * @returns
 */
export async function getUserTokenEvenNotExist(mint: string, symbol: string): Promise<SplToken | undefined> {
  const tokens = tokenAtom.get().tokens
  const userAddedTokens = tokenAtom.get().userAddedTokens
  const tokensHasLoaded = Object.keys(tokens).length > 0
  if (!tokensHasLoaded) return undefined // not load token list
  const token = tokenAtom.get().getToken(mint)
  if (!token) {
    const tokenDecimals = await getOnlineTokenDecimals(mint)
    if (tokenDecimals == null) return undefined

    const hasUserAddedTokensLoadedWhenGetOnlineTokenDecimals = userAddedTokens !== tokenAtom.get().userAddedTokens // userAddedTokens may loaded during await
    if (hasUserAddedTokensLoadedWhenGetOnlineTokenDecimals) return undefined
    const newCreatedToken = createSplToken({
      mint,
      decimals: tokenDecimals,
      symbol: symbol || mint.slice(0, 8),
      userAdded: Boolean(symbol)
    })

    tokenAtom.get().addUserAddedToken(newCreatedToken)
    return newCreatedToken
  } else {
    return token
  }
}
