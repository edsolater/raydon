/// <reference lib="webworker" />
import { addUserRPC } from '../effects/addUserRPC'
import { autoRefreshTokenAccount } from '../effects/autoRefreshTokenAccount'
import { autoRefreshTokenPrice } from '../effects/autoRefreshTokenPrice'
import { autoUpdateUserSelectableTokens } from '../effects/autoUpdateUserSelectableTokens'
import { initWalletBalance } from '../effects/initWalletBalance'
import { listenWalletAccountChange } from '../effects/listenWalletAccountChange'
import { loadLpTokens } from '../effects/loadLpTokens'
import { loadPredefinedRPC } from '../effects/loadPredefinedRPC'
import { loadTokenList } from '../effects/loadTokenList'
import { manuallyRefreshTokenAccount } from '../effects/manuallyRefreshTokenAccount'
import { registerWalletConnectNotifaction } from '../effects/registerWalletConnectNotifaction'
import { syncLoadUserAddedTokens } from '../effects/syncLoadUserAddedTokens'
import { syncTokenListSettings } from '../effects/syncTokenListSettings'
import { syncUserFlaggedTokenMints } from '../effects/syncUserFlaggedTokenMints'
import { autoUpdateBlockchainTime } from '../effects/updateBlockchainTime'
const self = globalThis as unknown as DedicatedWorkerGlobalScope

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
