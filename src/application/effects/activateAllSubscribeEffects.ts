import { connectionAtom } from '../connection'
import { autoHydrateFarmSDKParsedInfos } from '../farms/effects/autoHydrateFarmSDKParsedInfos'
import { autoRefetchFarmJsonInfos } from '../farms/effects/autoRefetchFarmJsonInfos'
import { autoSDKParseFarmJsonInfos } from '../farms/effects/autoSDKParseFarmJsonInfos'
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

  // farms
  autoRefetchFarmJsonInfos.activate()
  autoSDKParseFarmJsonInfos.activate()
  autoHydrateFarmSDKParsedInfos.activate()
}
