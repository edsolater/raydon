import { autoUpdateBlockchainTime } from './effects/autoUpdateBlockchainTime'
import { initializeDefaultConnection } from './effects/initializeDefaultConnection'
import { loadUserRPC } from './effects/loadUserRPC'

initializeDefaultConnection.activate()
autoUpdateBlockchainTime.activate()
loadUserRPC.activate()
