import { addUserRPC } from './addUserRPC'
import { autoRefreshTokenAccount } from './autoRefreshTokenAccount'
import { initWalletBalance } from './initWalletBalance'
import { listenWalletAccountChange } from './listenWalletAccountChange'
import { manuallyRefreshTokenAccount } from './manuallyRefreshTokenAccount'
import { registerWalletConnectNotifaction } from './registerWalletConnectNotifaction'
import { autoRefreshTokenPrice } from './autoRefreshTokenPrice'
import { autoUpdateUserSelectableTokens } from './autoUpdateUserSelectableTokens'
import { loadLpTokens } from './loadLpTokens'
import { loadTokenList } from './loadTokenList'
import { syncLoadUserAddedTokens } from './syncLoadUserAddedTokens'
import { syncTokenListSettings } from './syncTokenListSettings'
import { syncUserFlaggedTokenMints } from './syncUserFlaggedTokenMints'

export const activateAllSubscribeEffects = () => {
  // connection

  addUserRPC.activate()

  // wallet
  autoRefreshTokenAccount.activate()
  initWalletBalance.activate()
  listenWalletAccountChange.activate()
  manuallyRefreshTokenAccount.activate()
  registerWalletConnectNotifaction.activate()

  // token
  autoRefreshTokenPrice.activate()
  autoUpdateUserSelectableTokens.activate()
  loadLpTokens.activate()
  loadTokenList.activate()
  syncLoadUserAddedTokens.activate()
  syncTokenListSettings.activate()
  syncUserFlaggedTokenMints.activate()
}
