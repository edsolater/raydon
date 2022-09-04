/// <reference lib="webworker" />
import { loadPredefinedRPC } from '../effects/loadPredefinedRPC'
import { autoUpdateBlockchainTime } from '../effects/updateBlockchainTime'
const self = globalThis as unknown as DedicatedWorkerGlobalScope
self.addEventListener('message', ({ data }) => {
  if (data === 'start') {
    loadPredefinedRPC.activate()
    autoUpdateBlockchainTime.activate()
  }
})
