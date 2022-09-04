import { getLocalItem, setLocalItem } from '@/functions/dom/jStorage'
import toPubString from '@/functions/format/toMintString'
import { map } from '@edsolater/fnkit'
import { createXEffect, mergeXEffects } from '@edsolater/xstore'
import { SplTokenJsonInfo } from '@raydium-io/raydium-sdk'
import { SOLANA_TOKEN_LIST_NAME, tokenAtom, USER_ADDED_TOKEN_LIST_NAME } from '../token/atom'
import { createSplToken } from '../token/utils/createSplToken'

const initlyLoadTokenListSettings = createXEffect(() => {
  const userAddedTokens = getLocalItem<SplTokenJsonInfo[]>('TOKEN_LIST_USER_ADDED_TOKENS') ?? []
  const tokenListSwitchSettings = getLocalItem<{ [mapName: string]: boolean }>('TOKEN_LIST_SWITCH_SETTINGS') ?? {}

  tokenAtom.set((s) => ({
    userAddedTokens: new Map(userAddedTokens.map((t) => [toPubString(t.mint), createSplToken({ ...t })])),
    tokenListSettings: {
      ...s.tokenListSettings,
      [SOLANA_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[SOLANA_TOKEN_LIST_NAME],
        isOn: tokenListSwitchSettings[SOLANA_TOKEN_LIST_NAME] ?? s.tokenListSettings[SOLANA_TOKEN_LIST_NAME].isOn
      },
      [USER_ADDED_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME],
        mints: new Set(userAddedTokens.map((token) => toPubString(token.mint))),
        isOn:
          tokenListSwitchSettings[USER_ADDED_TOKEN_LIST_NAME] ?? s.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME].isOn
      }
    }
  }))
}, [])

const recordTokenListSettings = createXEffect(() => {
  const { tokenListSettings } = tokenAtom.get()
  setLocalItem(
    'TOKEN_LIST_SWITCH_SETTINGS',
    map(tokenListSettings, (i) => i.isOn)
  )
}, [tokenAtom.subscribe.tokenListSettings])

export const syncTokenListSettings = mergeXEffects(initlyLoadTokenListSettings, recordTokenListSettings)
