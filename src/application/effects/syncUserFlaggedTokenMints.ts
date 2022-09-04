import { getLocalItem, setLocalItem } from '@/functions/dom/jStorage'
import { createXEffect, mergeXEffects } from '@edsolater/xstore'
import { tokenAtom } from '../token/atom'

// whenever app start , get userFlaggedTokenMints from localStorage
const initlyLoadUserFlaggedTokenMints = createXEffect(() => {
  const recordedUserFlaggedTokenMints = getLocalItem<string[]>('USER_FLAGGED_TOKEN_MINTS')
  if (!recordedUserFlaggedTokenMints?.length) return
  tokenAtom.set({ userFlaggedTokenMints: new Set(recordedUserFlaggedTokenMints) })
}, [])

// whenever userFlaggedTokenMints changed, save it to localStorage
const recordUserFlaggedTokenMints = createXEffect(() => {
  setLocalItem('USER_FLAGGED_TOKEN_MINTS', Array.from(tokenAtom.get().userFlaggedTokenMints))
}, [tokenAtom.subscribe.userFlaggedTokenMints])

export const syncUserFlaggedTokenMints = mergeXEffects(recordUserFlaggedTokenMints, initlyLoadUserFlaggedTokenMints)
