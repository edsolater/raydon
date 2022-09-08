import { connectionAtom } from '../connection'
import { tokenAtom } from '../token'
import { walletAtom } from '../wallet'
import { listenWalletAccountChange } from './listenWalletAccountChange'
import { registerWalletConnectNotifaction } from './registerWalletConnectNotifaction'
import { establishXAtomMainThreadSide } from './webworkerUtil'

establishXAtomMainThreadSide({
  makeWorkerHandler: () => new Worker(new URL('./worker', import.meta.url)),
  atoms: [connectionAtom, tokenAtom, walletAtom]
})

export const activateAllSubscribeEffects = () => {
  // wallet
  listenWalletAccountChange.activate()
  registerWalletConnectNotifaction.activate()
}
