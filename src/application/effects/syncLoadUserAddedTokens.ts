import { getLocalItem, setLocalItem } from '@/functions/dom/jStorage'
import toPubString from '@/functions/format/toMintString'
import { createXEffect, mergeXEffects } from '@edsolater/xstore'
import { SplTokenJsonInfo } from '@raydium-io/raydium-sdk'
import { tokenAtom } from '../token/atom'
import { createSplToken } from '../token/utils/createSplToken'

const initlyLoadUserAddedTokens = createXEffect(() => {
  const userAddedTokens = getLocalItem<SplTokenJsonInfo[]>('TOKEN_LIST_USER_ADDED_TOKENS') ?? []
  tokenAtom.set({
    userAddedTokens: new Map(userAddedTokens.map((t) => [toPubString(t.mint), createSplToken({ ...t })]))
  })
}, [])

const recordUserAddedTokens = createXEffect(() => {
  const { userAddedTokens } = tokenAtom.get()
  setLocalItem('TOKEN_LIST_USER_ADDED_TOKENS', Array.from(userAddedTokens.values())) // add token / remove token
}, [tokenAtom.subscribe.userAddedTokens])

export const syncLoadUserAddedTokens = mergeXEffects(initlyLoadUserAddedTokens, recordUserAddedTokens)
