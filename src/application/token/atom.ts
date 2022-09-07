/************
 * * * ATOM *
 ************/

import { removeItem } from '@/functions/arrayMethods'
import toPubString from '@/functions/format/toMintString'
import { HexAddress, SrcAddress } from '@/types/constants'
import { createXAtom, createZustandStoreHook, XStoreAtom } from '@edsolater/xstore'
import { Price, PublicKeyish } from '@raydium-io/raydium-sdk'
import produce from 'immer'
import { LpToken, SplToken, TokenJson } from './type'
import {
  isQuantumSOL,
  isQuantumSOLVersionWSOL,
  QuantumSOLToken,
  QuantumSOLVersionSOL,
  QuantumSOLVersionWSOL,
  SOLUrlMint,
  WSOLMint
} from './utils/quantumSOL'
import { refreshTokenPrice } from './utils/refreshTokenPrice'
import { sortTokens } from './utils/sortTokens'

export type TokenStore = {
  tokenIconSrcs: Record<HexAddress, SrcAddress>
  tokenJsonInfos: Record<HexAddress, TokenJson>

  // has QuantumSOL
  tokens: Record<HexAddress, SplToken | QuantumSOLToken>
  // no QuantumSOL
  pureTokens: Record<HexAddress, SplToken>
  // has QuantumSOLVersionSOL and QuantumSOLVersionWSOL
  verboseTokens: (SplToken | QuantumSOLToken)[]

  // has QuantumSOL
  lpTokens: Record<HexAddress, LpToken>

  /**
   * has QuantumSOL\
   * can only get token in tokenList \
   * TODO:should also get user Added Token \
   * exact mode: 'so111111112' will be QSOL-WSOL\
   * support both spl and lp
   */
  getToken(
    mint: PublicKeyish | undefined,
    options?: { /* use WSOL instead of isQuantumSOLVersionWSOL */ exact?: boolean }
  ): SplToken | undefined

  /**  noQuantumSOL*/
  /** can only get token in tokenList */
  getPureToken(mint: PublicKeyish | undefined): SplToken | undefined

  /** can only get token in tokenList */
  getLpToken(mint: PublicKeyish | undefined): LpToken | undefined

  // QuantumSOL will be 'sol' and 'So11111111111111111111111111111111111111112'
  toUrlMint(token: SplToken | QuantumSOLToken | undefined): string

  // url may be 'sol'
  fromUrlString(mintlike: string): SplToken | QuantumSOLToken

  isLpToken(mint: PublicKeyish | undefined): boolean

  /** it does't contain lp tokens' price  */
  tokenPrices: Record<HexAddress, Price>

  // TODO token mint in blacklist means it can't be selected or add by user Added
  blacklist: string[]

  // TODO: solana token mints
  // TODO: raydium token mints
  userAddedTokens: Map<HexAddress /* mint */, SplToken>
  canFlaggedTokenMints: Set<HexAddress>
  userFlaggedTokenMints: Set<HexAddress /* mint */> // flagged must in user added
  sortTokens(tokens: SplToken[]): SplToken[]
  toggleFlaggedToken(token: SplToken): void
  allSelectableTokens: SplToken[]
  addUserAddedToken(options: SplToken): void
  deleteUserAddedToken(options: SplToken): void
  tokenListSettings: {
    [N in SupportedTokenListSettingName]: {
      mints?: Set<HexAddress> // TODO
      disableUserConfig?: boolean
      isOn: boolean
      icon?: SrcAddress
      cannotbBeSeen?: boolean
    }
  }
  refreshTokenCount: number
  refreshTokenPrice(): void
}

export type SupportedTokenListSettingName =
  | 'Raydium Token List' // actually  official
  | 'Raydium Dev Token List'
  | 'Solana Token List' // actually  unOfficial
  | 'User Added Token List'
export const RAYDIUM_MAINNET_TOKEN_LIST_NAME_DEPRECATED = 'Raydium Mainnet Token List'
export const RAYDIUM_MAINNET_TOKEN_LIST_NAME = 'Raydium Token List'
export const RAYDIUM_DEV_TOKEN_LIST_NAME = 'Raydium Dev Token List'
export const SOLANA_TOKEN_LIST_NAME = 'Solana Token List'
export const USER_ADDED_TOKEN_LIST_NAME = 'User Added Token List'

export type TokenAtom = XStoreAtom<TokenStore>

const toUrlMint = (token: SplToken | QuantumSOLToken | undefined) =>
  isQuantumSOL(token) ? (isQuantumSOLVersionWSOL(token) ? String(WSOLMint) : SOLUrlMint) : String(token?.mint ?? '')
const fromUrlString = (mintlike: string) =>
  mintlike === SOLUrlMint
    ? QuantumSOLVersionSOL
    : mintlike === String(WSOLMint)
    ? QuantumSOLVersionWSOL
    : tokenAtom.get().tokens[mintlike]

const addUserAddedToken = (token: SplToken) => {
  tokenAtom.set((s) => ({
    userAddedTokens: s.userAddedTokens.set(toPubString(token.mint), token),
    tokenListSettings: {
      ...s.tokenListSettings,
      [USER_ADDED_TOKEN_LIST_NAME]: {
        ...s.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME],
        mints: (s.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME].mints ?? new Set()).add(toPubString(token.mint))
      }
    }
  }))
}
const deleteUserAddedToken = (token: SplToken) => {
  tokenAtom.set((s) =>
    produce(s, (draft) => {
      delete draft.userAddedTokens[toPubString(token.mint)]
      draft.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME].mints = removeItem(
        s.tokenListSettings[USER_ADDED_TOKEN_LIST_NAME].mints ?? new Set<string>(),
        toPubString(token.mint)
      )
    })
  )
}
const toggleFlaggedToken = (token: SplToken) => {
  tokenAtom.set({ userFlaggedTokenMints: toggleSetItem(tokenAtom.get().userFlaggedTokenMints, String(token.mint)) })
}

export const tokenAtom = createXAtom<TokenStore>({
  name: 'token',
  default: {
    tokenIconSrcs: {},

    tokenJsonInfos: {},

    // wsol -> quantumSOL(include sol info)
    tokens: {},
    // no sol just wsol(it's the raw info)
    pureTokens: {},
    // include all token (both QuantumSOLVersionSOL and QuantumSOLVersionWSOL), their mint is all WSOL's mint, so can't be a object, must be an array
    verboseTokens: [],

    // lpToken have not SOL, no need pure and verbose
    lpTokens: {},

    getToken: () => undefined,

    getLpToken: () => undefined,

    toUrlMint,

    fromUrlString,

    getPureToken: () => undefined,

    isLpToken: () => false,

    tokenPrices: {},
    blacklist: [],

    userAddedTokens: new Map(),
    addUserAddedToken,
    deleteUserAddedToken,
    canFlaggedTokenMints: new Set(),
    userFlaggedTokenMints: new Set(),
    toggleFlaggedToken,
    allSelectableTokens: [],

    sortTokens,

    tokenListSettings: {
      [RAYDIUM_MAINNET_TOKEN_LIST_NAME]: {
        disableUserConfig: true,
        isOn: true
      },
      [RAYDIUM_DEV_TOKEN_LIST_NAME]: {
        disableUserConfig: true,
        isOn: true,
        cannotbBeSeen: true
      },
      [SOLANA_TOKEN_LIST_NAME]: {
        isOn: true
      },
      [USER_ADDED_TOKEN_LIST_NAME]: {
        isOn: true
      }
    },

    refreshTokenCount: 0,
    refreshTokenPrice: refreshTokenPrice
  }
})

//TODO  move to fnkit
function toggleSetItem<T>(set: Set<T>, item: T) {
  const newSet = new Set(set)
  if (newSet.has(item)) {
    newSet.delete(item)
  } else {
    newSet.add(item)
  }
  return newSet
}
