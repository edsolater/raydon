type WalletAccountChangeListener = () => void

type ListenerId = number

type InnerWalletAccountChangeListenerSettings = {
  lifetime: 'confirmed' | 'finalized'
  listenerId: ListenerId
  cb: WalletAccountChangeListener
  once?: boolean
}

let walletAccountChangeListeners: InnerWalletAccountChangeListenerSettings[] = []
let listenerIdCounter = 1

// TODO: the code form  of use this is not straightforward, should be integrated in handleMultiTx
export function addWalletAccountChangeListener(
  cb: () => void,
  options?: {
    /** default is 'confirmed' */
    lifetime?: 'confirmed' | 'finalized'
    once?: boolean
  }
) {
  const listenerId = listenerIdCounter
  listenerIdCounter += 1
  walletAccountChangeListeners.push({
    lifetime: options?.lifetime ?? 'confirmed',
    cb,
    once: options?.once,
    listenerId: listenerId
  })
  return listenerId
}

export function removeWalletAccountChangeListener(id: ListenerId) {
  const idx = walletAccountChangeListeners.findIndex((l) => l.listenerId === id)
  if (idx >= 0) {
    walletAccountChangeListeners.splice(idx, 1)
  }
}

export function invokeWalletAccountChangeListeners(lifeTime: 'confirmed' | 'finalized') {
  walletAccountChangeListeners.forEach((l) => l.cb())
  walletAccountChangeListeners = walletAccountChangeListeners.filter((l) => !(l.lifetime === lifeTime && l.once))
}
