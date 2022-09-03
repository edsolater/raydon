import { autoUpdateBlockchainTime } from './updateBlockchainTime'
import { loadPredefinedRPC } from './loadPredefinedRPC'
import { addUserRPC } from './addUserRPC'
import { autoRefreshTokenAccount } from './autoRefreshTokenAccount'
import { initWalletBalance } from './initWalletBalance'
import { listenWalletAccountChange } from './listenWalletAccountChange'
import { manuallyRefreshTokenAccount } from './manuallyRefreshTokenAccount'
import { registerWalletConnectNotifaction } from './registerWalletConnectNotifaction'

export const activateAllSubscribeEffects = () => {
  // connection
  loadPredefinedRPC.activate()
  autoUpdateBlockchainTime.activate()
  addUserRPC.activate()

  // wallet
  autoRefreshTokenAccount.activate()
  initWalletBalance.activate()
  listenWalletAccountChange.activate()
  manuallyRefreshTokenAccount.activate()
  registerWalletConnectNotifaction.activate()
}
