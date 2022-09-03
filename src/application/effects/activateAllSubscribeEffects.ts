import { autoUpdateBlockchainTime } from './updateBlockchainTime'
import { loadPredefinedRPC } from './loadPredefinedRPC'
import { addUserRPC } from './addUserRPC'

export const activateAllSubscribeEffects = () => {
  loadPredefinedRPC.activate()
  autoUpdateBlockchainTime.activate()
  addUserRPC.activate()
}
