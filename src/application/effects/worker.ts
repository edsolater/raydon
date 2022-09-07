/// <reference lib="webworker" />
import { connectionAtom } from '../connection'
import { addUserRPC } from './addUserRPC'
import { loadPredefinedRPC } from './loadPredefinedRPC'
import { autoUpdateBlockchainTime } from './updateBlockchainTime'
import { establishXAtomWebworkerSide } from './webworkerUtil'

establishXAtomWebworkerSide([connectionAtom])

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

// // token
// autoRefreshTokenPrice.activate()
// autoUpdateUserSelectableTokens.activate()
// loadLpTokens.activate()
// loadTokenList.activate()
// syncLoadUserAddedTokens.activate()
// syncTokenListSettings.activate()
// syncUserFlaggedTokenMints.activate()
