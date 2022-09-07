/// <reference lib="webworker" />
import { connectionAtom } from '../connection'
import { tokenAtom } from '../token'
import { addUserRPC } from './addUserRPC'
import { autoRefreshTokenPrice } from './autoRefreshTokenPrice'
import { autoUpdateUserSelectableTokens } from './autoUpdateUserSelectableTokens'
import { loadLpTokens } from './loadLpTokens'
import { loadPredefinedRPC } from './loadPredefinedRPC'
import { loadTokenList } from './loadTokenList'
import { syncLoadUserAddedTokens } from './syncLoadUserAddedTokens'
import { syncTokenListSettings } from './syncTokenListSettings'
import { syncUserFlaggedTokenMints } from './syncUserFlaggedTokenMints'
import { autoUpdateBlockchainTime } from './updateBlockchainTime'
import { establishXAtomWebworkerSide } from './webworkerUtil'

establishXAtomWebworkerSide([connectionAtom, tokenAtom])

// connection
loadPredefinedRPC.activate()
autoUpdateBlockchainTime.activate()
addUserRPC.activate()

// // wallet
// autoRefreshTokenAccount.activate()
// initWalletBalance.activate()
// listenWalletAccountChange.activate()
// manuallyRefreshTokenAccount.activate()
// registerWalletConnectNotifaction.activate()

// token
autoRefreshTokenPrice.activate()
autoUpdateUserSelectableTokens.activate()
loadLpTokens.activate()
loadTokenList.activate()
syncLoadUserAddedTokens.activate()
syncTokenListSettings.activate()
syncUserFlaggedTokenMints.activate()
