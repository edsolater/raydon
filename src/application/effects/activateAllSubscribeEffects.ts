import { connectionAtom } from '../connection'
import { autoHydrateFarmSDKParsedInfos } from '../farms/effects/autoHydrateFarmSDKParsedInfos'
import { autoRefetchFarmJsonInfos } from '../farms/effects/autoRefetchFarmJsonInfos'
import { autoSDKParseFarmJsonInfos } from '../farms/effects/autoSDKParseFarmJsonInfos'
import { autoResetFarmCreatedBySelf } from '../farms/effects/autoResetFarmCreatedBySelf'
import { tokenAtom } from '../token'
import { walletAtom } from '../wallet'
import { listenWalletAccountChange } from './listenWalletAccountChange'
import { registerWalletConnectNotifaction } from './registerWalletConnectNotifaction'
import { establishXAtomMainThreadSide } from './webworkerUtil'
import { autoComposeLpPrices } from '../pools/effects/autoComposeLpPrices'
import { autoHydratePairInfo } from '../pools/effects/autoHydratePairInfo'
import { autoRefetchPairJsonInfo } from '../pools/effects/autoRefetchPairJsonInfo'
import { autoRefreshTvlAndVolume24hData } from '../pools/effects/autoRefreshTvlAndVolume24hData'
import { startPoolIntervalRefresh } from '../pools/effects/startPoolIntervalRefresh'

establishXAtomMainThreadSide({
  makeWorkerHandler: () => new Worker(new URL('./worker', import.meta.url)),
  atoms: [connectionAtom, tokenAtom, walletAtom]
})

export const activateAllSubscribeEffects = () => {
  // wallet
  listenWalletAccountChange.activate()
  registerWalletConnectNotifaction.activate()

  // farms
  autoResetFarmCreatedBySelf.activate() // for UI
  autoRefetchFarmJsonInfos.activate()
  autoSDKParseFarmJsonInfos.activate()
  autoHydrateFarmSDKParsedInfos.activate()

  // pools
  autoComposeLpPrices.activate()
  autoHydratePairInfo.activate()
  autoRefetchPairJsonInfo.activate()
  autoRefreshTvlAndVolume24hData.activate()
  startPoolIntervalRefresh.activate()
}
