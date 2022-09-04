import toPubString from '@/functions/format/toMintString'
import { createXEffect } from '@edsolater/xstore'
import { SplToken } from '../token'
import { tokenAtom } from '../token/atom'
import { sortTokens } from '../token/utils/sortTokens'

/**
 * a feature hook
 * base on user's token list settings, load corresponding tokens
 */
export const autoUpdateUserSelectableTokens = createXEffect(() => {
  tokenAtom.set({
    allSelectableTokens: sortTokens(filterListConfigOpenedTokens(getAllTokens()))
  })
}, [
  // TODO FIXME: should also change when wallet owner change
  tokenAtom.subscribe.verboseTokens,
  tokenAtom.subscribe.userAddedTokens,
  tokenAtom.subscribe.tokenListSettings,
  tokenAtom.subscribe.userFlaggedTokenMints,
  tokenAtom.subscribe.sortTokens
])

function getAllTokens() {
  const { verboseTokens, userAddedTokens } = tokenAtom.get()
  return [...Object.values(userAddedTokens), ...verboseTokens]
}
/**
 * user has open it in token list setting
 */
function filterListConfigOpenedTokens(tokens: SplToken[]) {
  const { tokenListSettings } = tokenAtom.get()
  const activeTokenListNames = Object.entries(tokenListSettings)
    .filter(([, setting]) => setting.isOn)
    .map(([name]) => name)

  const tokenIsIncludedByActiveTokenLists = (token: SplToken) =>
    activeTokenListNames.some((tokenListName) => tokenListSettings[tokenListName]?.mints?.has(toPubString(token.mint)))

  return tokens.filter((token) => tokenIsIncludedByActiveTokenLists(token))
}
