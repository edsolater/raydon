import { connectionAtom } from '../connection'
import { tokenAtom } from '../token'
import { addUserRPC } from './addUserRPC'
import { autoRefreshTokenAccount } from './autoRefreshTokenAccount'
import { autoRefreshTokenPrice } from './autoRefreshTokenPrice'
import { autoUpdateUserSelectableTokens } from './autoUpdateUserSelectableTokens'
import { initWalletBalance } from './initWalletBalance'
import { listenWalletAccountChange } from './listenWalletAccountChange'
import { loadLpTokens } from './loadLpTokens'
import { loadTokenList } from './loadTokenList'
import { manuallyRefreshTokenAccount } from './manuallyRefreshTokenAccount'
import { registerWalletConnectNotifaction } from './registerWalletConnectNotifaction'
import { syncLoadUserAddedTokens } from './syncLoadUserAddedTokens'
import { syncTokenListSettings } from './syncTokenListSettings'
import { syncUserFlaggedTokenMints } from './syncUserFlaggedTokenMints'
import { establishXAtomMainThreadSide } from './webworkerUtil'

establishXAtomMainThreadSide({
  makeWorkerHandler: () => new Worker(new URL('./worker', import.meta.url)),
  atoms: [connectionAtom, tokenAtom]
})

export const activateAllSubscribeEffects = () => {
  // wallet
  autoRefreshTokenAccount.activate()
  initWalletBalance.activate()
  listenWalletAccountChange.activate()
  manuallyRefreshTokenAccount.activate()
  registerWalletConnectNotifaction.activate()
}
