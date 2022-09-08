/// <reference lib="webworker" />
import { connectionAtom } from '../connection'
import { tokenAtom } from '../token'
import { walletAtom } from '../wallet'
import { addUserRPC } from './addUserRPC'
import { autoRefreshTokenAccount } from './autoRefreshTokenAccount'
import { autoRefreshTokenPrice } from './autoRefreshTokenPrice'
import { autoUpdateUserSelectableTokens } from './autoUpdateUserSelectableTokens'
import { initWalletBalance } from './initWalletBalance'
import { loadLpTokens } from './loadLpTokens'
import { loadPredefinedRPC } from './loadPredefinedRPC'
import { loadTokenList } from './loadTokenList'
import { manuallyRefreshTokenAccount } from './manuallyRefreshTokenAccount'
import { syncLoadUserAddedTokens } from './syncLoadUserAddedTokens'
import { syncTokenListSettings } from './syncTokenListSettings'
import { syncUserFlaggedTokenMints } from './syncUserFlaggedTokenMints'
import { autoUpdateBlockchainTime } from './updateBlockchainTime'
import { establishXAtomWebworkerSide } from './webworkerUtil'

establishXAtomWebworkerSide([connectionAtom, tokenAtom, walletAtom])

// connection
loadPredefinedRPC.activate()
autoUpdateBlockchainTime.activate()
addUserRPC.activate()

// wallet
autoRefreshTokenAccount.activate()
initWalletBalance.activate()
manuallyRefreshTokenAccount.activate()

// token
autoRefreshTokenPrice.activate()
autoUpdateUserSelectableTokens.activate()
loadLpTokens.activate()
loadTokenList.activate()
syncLoadUserAddedTokens.activate()
syncTokenListSettings.activate()
syncUserFlaggedTokenMints.activate()
