import toPubString from '@/functions/format/toMintString'
import { createXEffect } from '@edsolater/xstore'
import { tokenAtom, USER_ADDED_TOKEN_LIST_NAME } from '../token/atom'
import { sortTokens } from '../token/utils/sortTokens'

/**
 * a feature hook
 * base on user's token list settings, load corresponding tokens
 */
export const autoUpdateSelectableTokens = createXEffect(() => {
  const { tokenListSettings, verboseTokens, userAddedTokens, userFlaggedTokenMints } = tokenAtom.get()
  const activeTokenListNames = Object.entries(tokenListSettings)
    .filter(([, setting]) => setting.isOn)
    .map(([name]) => name)

  const havUserAddedTokens = activeTokenListNames.some((tokenListName) => tokenListName === USER_ADDED_TOKEN_LIST_NAME)

  const verboseTokensMints = verboseTokens.map((t) => toPubString(t.mint))
  const filteredUserAddedTokens = (havUserAddedTokens ? [...userAddedTokens.values()] : []).filter(
    (i) => !verboseTokensMints.includes(toPubString(i.mint))
  )
  const settingsFiltedTokens = [...verboseTokens, ...filteredUserAddedTokens].filter((token) => {
    const isUserFlagged = tokenListSettings[USER_ADDED_TOKEN_LIST_NAME] && userFlaggedTokenMints.has(String(token.mint))
    const isOnByTokenList = activeTokenListNames.some((tokenListName) =>
      tokenListSettings[tokenListName]?.mints?.has(String(token.mint))
    )
    return isUserFlagged || isOnByTokenList
  })

  tokenAtom.set({
    allSelectableTokens: sortTokens(settingsFiltedTokens)
  })
}, [
  // TODO FIXME: should also change when wallet owner change
  tokenAtom.subscribe.verboseTokens,
  tokenAtom.subscribe.userAddedTokens,
  tokenAtom.subscribe.tokenListSettings,
  tokenAtom.subscribe.userFlaggedTokenMints,
  tokenAtom.subscribe.sortTokens
])
